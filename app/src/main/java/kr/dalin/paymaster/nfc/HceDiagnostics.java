package kr.dalin.paymaster.nfc;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.SystemClock;

import org.json.JSONArray;
import org.json.JSONObject;

public final class HceDiagnostics {
    public static final String ACTION_DIAGNOSTIC =
            "kr.dalin.paymaster.action.HCE_DIAGNOSTIC";
    public static final String EXTRA_EVENT_JSON = "eventJson";

    private static final String PREFS = "dalin_hce_diagnostics";
    private static final int MAX_TRACE = 40;

    private HceDiagnostics() {}

    public static synchronized void reset(Context context) {
        prefs(context).edit()
                .clear()
                .putInt("apduCount", 0)
                .putBoolean("ourAidSelected", false)
                .putString("lastApduHex", "")
                .putString("lastEvent", "RESET")
                .putString("lastDeactivateReason", "")
                .putString("traceJson", "[]")
                .putLong("lastEventElapsedMs", SystemClock.elapsedRealtime())
                .apply();
        appendTrace(context, "RESET", "");
        emit(context, "RESET", "");
    }

    public static synchronized void recordApdu(Context context, byte[] apdu) {
        SharedPreferences p = prefs(context);
        int count = p.getInt("apduCount", 0) + 1;
        String hex = toHexLimited(apdu, 256);

        p.edit()
                .putInt("apduCount", count)
                .putString("lastApduHex", hex)
                .putString("lastEvent", "APDU_RX")
                .putLong("lastEventElapsedMs", SystemClock.elapsedRealtime())
                .apply();

        appendTrace(context, "RX", hex);
        emit(context, "APDU_RX", hex);
    }

    public static synchronized void recordOurAidSelected(Context context) {
        prefs(context).edit()
                .putBoolean("ourAidSelected", true)
                .putString("lastEvent", "OUR_AID_SELECTED")
                .putLong("lastEventElapsedMs", SystemClock.elapsedRealtime())
                .apply();

        appendTrace(context, "AID", DalinPayProtocol.AID_HEX);
        emit(context, "OUR_AID_SELECTED", DalinPayProtocol.AID_HEX);
    }

    public static synchronized void recordResponse(Context context, byte[] response) {
        String hex = toHexLimited(response, 256);
        appendTrace(context, "TX", hex);
        emit(context, "APDU_TX", hex);
    }

    public static synchronized void recordDeactivated(Context context, int reason) {
        String reasonText;
        if (reason == android.nfc.cardemulation.HostApduService.DEACTIVATION_LINK_LOSS) {
            reasonText = "LINK_LOSS";
        } else if (reason == android.nfc.cardemulation.HostApduService.DEACTIVATION_DESELECTED) {
            reasonText = "DESELECTED";
        } else {
            reasonText = "UNKNOWN_" + reason;
        }

        prefs(context).edit()
                .putString("lastDeactivateReason", reasonText)
                .putString("lastEvent", "DEACTIVATED")
                .putLong("lastEventElapsedMs", SystemClock.elapsedRealtime())
                .apply();

        appendTrace(context, "DEACTIVATED", reasonText);
        emit(context, "DEACTIVATED", reasonText);
    }

    private static void appendTrace(Context context, String type, String detail) {
        try {
            SharedPreferences p = prefs(context);
            JSONArray oldArr = new JSONArray(p.getString("traceJson", "[]"));
            JSONArray next = new JSONArray();

            int start = Math.max(0, oldArr.length() - (MAX_TRACE - 1));
            for (int i = start; i < oldArr.length(); i++) {
                next.put(oldArr.get(i));
            }

            JSONObject item = new JSONObject();
            item.put("t", SystemClock.elapsedRealtime());
            item.put("type", type);
            item.put("detail", detail == null ? "" : detail);
            next.put(item);

            p.edit().putString("traceJson", next.toString()).apply();
        } catch (Exception ignored) {}
    }

    public static synchronized String snapshotJson(Context context) {
        try {
            SharedPreferences p = prefs(context);
            JSONObject o = new JSONObject();
            o.put("apduCount", p.getInt("apduCount", 0));
            o.put("ourAidSelected", p.getBoolean("ourAidSelected", false));
            o.put("lastApduHex", p.getString("lastApduHex", ""));
            o.put("lastEvent", p.getString("lastEvent", ""));
            o.put("lastDeactivateReason", p.getString("lastDeactivateReason", ""));
            o.put("lastEventElapsedMs", p.getLong("lastEventElapsedMs", 0L));
            o.put("aid", DalinPayProtocol.AID_HEX);
            o.put("protocolVersion", DalinPayProtocol.PROTOCOL_VERSION);
            o.put("trace", new JSONArray(p.getString("traceJson", "[]")));
            return o.toString();
        } catch (Exception e) {
            return "{\"error\":\"snapshot_failed\"}";
        }
    }

    public static synchronized String traceText(Context context) {
        try {
            JSONObject snap = new JSONObject(snapshotJson(context));
            JSONArray trace = snap.optJSONArray("trace");
            StringBuilder sb = new StringBuilder();
            sb.append("DALIN-PAY HCE TRACE\n");
            sb.append("AID=").append(DalinPayProtocol.AID_HEX).append('\n');
            sb.append("APDU_COUNT=").append(snap.optInt("apduCount")).append('\n');
            sb.append("OUR_AID_SELECTED=").append(snap.optBoolean("ourAidSelected")).append('\n');
            sb.append("LAST_DEACTIVATE=").append(snap.optString("lastDeactivateReason")).append('\n');
            sb.append('\n');

            if (trace != null) {
                for (int i = 0; i < trace.length(); i++) {
                    JSONObject item = trace.optJSONObject(i);
                    if (item == null) continue;
                    sb.append(item.optLong("t"))
                      .append("  ")
                      .append(item.optString("type"))
                      .append("  ")
                      .append(item.optString("detail"))
                      .append('\n');
                }
            }
            return sb.toString();
        } catch (Exception e) {
            return "TRACE_FAILED";
        }
    }

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private static void emit(Context context, String type, String detail) {
        try {
            JSONObject o = new JSONObject();
            o.put("type", type);
            o.put("detail", detail == null ? "" : detail);
            o.put("snapshot", new JSONObject(snapshotJson(context)));

            Intent intent = new Intent(ACTION_DIAGNOSTIC);
            intent.setPackage(context.getPackageName());
            intent.putExtra(EXTRA_EVENT_JSON, o.toString());
            context.sendBroadcast(intent);
        } catch (Exception ignored) {}
    }

    public static String toHexLimited(byte[] data, int maxBytes) {
        if (data == null) return "";
        int length = Math.min(data.length, Math.max(0, maxBytes));
        StringBuilder sb = new StringBuilder(length * 3);

        for (int i = 0; i < length; i++) {
            if (i > 0) sb.append(' ');
            sb.append(String.format("%02X", data[i] & 0xFF));
        }

        if (data.length > length) {
            sb.append(" ...(").append(data.length).append(" bytes)");
        }
        return sb.toString();
    }
}
