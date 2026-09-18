package kr.dalin.paymaster.nfc;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.nfc.NfcAdapter;
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
                .putString("remoteFieldDetected", "UNKNOWN")
                .putInt("remoteFieldEventCount", 0)
                .putString("lastRoutingEvent", "")
                .putString("lastRoutingAid", "")
                .putInt("aidConflictCount", 0)
                .putInt("aidNotRoutedCount", 0)
                .putString("preferredService", "UNKNOWN")
                .putString("observeMode", "UNKNOWN")
                .putString("offHostSelection", "")
                .putString("lastNfcInternalError", "")
                .putString("lastNfcState", "UNKNOWN")
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

    public static synchronized void recordRemoteFieldChanged(
            Context context,
            boolean detected
    ) {
        SharedPreferences p = prefs(context);
        int count = p.getInt("remoteFieldEventCount", 0) + 1;
        String state = detected ? "YES" : "NO";

        p.edit()
                .putString("remoteFieldDetected", state)
                .putInt("remoteFieldEventCount", count)
                .putString("lastRoutingEvent", "REMOTE_FIELD_" + state)
                .putLong("lastEventElapsedMs", SystemClock.elapsedRealtime())
                .apply();

        appendTrace(context, "RF_FIELD", state);
        emit(context, "REMOTE_FIELD_CHANGED", state);
    }

    public static synchronized void recordAidConflict(Context context, String aid) {
        SharedPreferences p = prefs(context);
        int count = p.getInt("aidConflictCount", 0) + 1;
        String safeAid = systemAid(aid);

        p.edit()
                .putInt("aidConflictCount", count)
                .putString("lastRoutingEvent", "AID_CONFLICT")
                .putString("lastRoutingAid", safeAid)
                .putLong("lastEventElapsedMs", SystemClock.elapsedRealtime())
                .apply();

        appendTrace(context, "AID_CONFLICT", safeAid);
        emit(context, "AID_CONFLICT", safeAid);
    }

    public static synchronized void recordAidNotRouted(Context context, String aid) {
        SharedPreferences p = prefs(context);
        int count = p.getInt("aidNotRoutedCount", 0) + 1;
        String safeAid = systemAid(aid);

        p.edit()
                .putInt("aidNotRoutedCount", count)
                .putString("lastRoutingEvent", "AID_NOT_ROUTED")
                .putString("lastRoutingAid", safeAid)
                .putLong("lastEventElapsedMs", SystemClock.elapsedRealtime())
                .apply();

        appendTrace(context, "AID_NOT_ROUTED", safeAid);
        emit(context, "AID_NOT_ROUTED", safeAid);
    }

    public static synchronized void recordPreferredServiceChanged(
            Context context,
            boolean preferred
    ) {
        String state = preferred ? "YES" : "NO";
        prefs(context).edit()
                .putString("preferredService", state)
                .putString("lastRoutingEvent", "PREFERRED_SERVICE_" + state)
                .putLong("lastEventElapsedMs", SystemClock.elapsedRealtime())
                .apply();

        appendTrace(context, "PREFERRED_SERVICE", state);
        emit(context, "PREFERRED_SERVICE_CHANGED", state);
    }

    public static synchronized void recordObserveModeChanged(
            Context context,
            boolean enabled
    ) {
        String state = enabled ? "ON" : "OFF";
        prefs(context).edit()
                .putString("observeMode", state)
                .putString("lastRoutingEvent", "OBSERVE_MODE_" + state)
                .putLong("lastEventElapsedMs", SystemClock.elapsedRealtime())
                .apply();

        appendTrace(context, "OBSERVE_MODE", state);
        emit(context, "OBSERVE_MODE_CHANGED", state);
    }

    public static synchronized void recordOffHostAidSelected(
            Context context,
            String aid
    ) {
        String safeAid = systemAid(aid);
        prefs(context).edit()
                .putString("offHostSelection", safeAid)
                .putString("lastRoutingEvent", "OFF_HOST_AID_SELECTED")
                .putString("lastRoutingAid", safeAid)
                .putLong("lastEventElapsedMs", SystemClock.elapsedRealtime())
                .apply();

        appendTrace(context, "OFF_HOST_AID", safeAid);
        emit(context, "OFF_HOST_AID_SELECTED", safeAid);
    }

    public static synchronized void recordNfcInternalError(
            Context context,
            int errorType
    ) {
        String detail = "TYPE_" + errorType;
        prefs(context).edit()
                .putString("lastNfcInternalError", detail)
                .putString("lastRoutingEvent", "NFC_INTERNAL_ERROR")
                .putLong("lastEventElapsedMs", SystemClock.elapsedRealtime())
                .apply();

        appendTrace(context, "NFC_INTERNAL_ERROR", detail);
        emit(context, "NFC_INTERNAL_ERROR", detail);
    }

    public static synchronized void recordNfcStateChanged(Context context, int state) {
        String stateText = nfcStateText(state);
        prefs(context).edit()
                .putString("lastNfcState", stateText)
                .putString("lastRoutingEvent", "NFC_STATE_" + stateText)
                .putLong("lastEventElapsedMs", SystemClock.elapsedRealtime())
                .apply();

        appendTrace(context, "NFC_STATE", stateText);
        emit(context, "NFC_STATE_CHANGED", stateText);
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
            o.put("remoteFieldDetected", p.getString("remoteFieldDetected", "UNKNOWN"));
            o.put("remoteFieldEventCount", p.getInt("remoteFieldEventCount", 0));
            o.put("lastRoutingEvent", p.getString("lastRoutingEvent", ""));
            o.put("lastRoutingAid", p.getString("lastRoutingAid", ""));
            o.put("aidConflictCount", p.getInt("aidConflictCount", 0));
            o.put("aidNotRoutedCount", p.getInt("aidNotRoutedCount", 0));
            o.put("preferredService", p.getString("preferredService", "UNKNOWN"));
            o.put("observeMode", p.getString("observeMode", "UNKNOWN"));
            o.put("offHostSelection", p.getString("offHostSelection", ""));
            o.put("lastNfcInternalError", p.getString("lastNfcInternalError", ""));
            o.put("lastNfcState", p.getString("lastNfcState", "UNKNOWN"));
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
            sb.append("REMOTE_FIELD=").append(snap.optString("remoteFieldDetected")).append('\n');
            sb.append("REMOTE_FIELD_EVENTS=").append(snap.optInt("remoteFieldEventCount")).append('\n');
            sb.append("AID_NOT_ROUTED=").append(snap.optInt("aidNotRoutedCount")).append('\n');
            sb.append("AID_CONFLICT=").append(snap.optInt("aidConflictCount")).append('\n');
            sb.append("LAST_ROUTING_EVENT=").append(snap.optString("lastRoutingEvent")).append('\n');
            sb.append("LAST_ROUTING_AID=").append(snap.optString("lastRoutingAid")).append('\n');
            sb.append("PREFERRED_SERVICE=").append(snap.optString("preferredService")).append('\n');
            sb.append("OBSERVE_MODE=").append(snap.optString("observeMode")).append('\n');
            sb.append("OFF_HOST_SELECTION=").append(snap.optString("offHostSelection")).append('\n');
            sb.append("LAST_NFC_INTERNAL_ERROR=").append(snap.optString("lastNfcInternalError")).append('\n');
            sb.append("LAST_NFC_STATE=").append(snap.optString("lastNfcState")).append('\n');
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

    private static String systemAid(String aid) {
        return aid == null ? "" : aid;
    }

    private static String nfcStateText(int state) {
        if (state == NfcAdapter.STATE_OFF) return "OFF";
        if (state == NfcAdapter.STATE_TURNING_ON) return "TURNING_ON";
        if (state == NfcAdapter.STATE_ON) return "ON";
        if (state == NfcAdapter.STATE_TURNING_OFF) return "TURNING_OFF";
        return "UNKNOWN_" + state;
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
