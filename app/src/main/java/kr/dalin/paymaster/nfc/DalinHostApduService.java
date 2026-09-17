package kr.dalin.paymaster.nfc;

import android.content.Intent;
import android.nfc.cardemulation.HostApduService;
import android.os.Bundle;
import android.util.Log;

import org.json.JSONObject;

import java.nio.charset.StandardCharsets;

public class DalinHostApduService extends HostApduService {
    public static final String ACTION_PAYMENT_SUCCESS =
            "kr.dalin.paymaster.action.NFC_PAYMENT_SUCCESS";
    public static final String EXTRA_TRANSACTION_ID = "transactionId";
    public static final String EXTRA_AMOUNT = "amount";
    public static final String EXTRA_CURRENCY = "currency";

    private static final String TAG = "DalinPayHCE";
    private boolean aidSelected = false;

    @Override
    public byte[] processCommandApdu(byte[] apdu, Bundle extras) {
        HceDiagnostics.recordApdu(this, apdu);
        Log.i(TAG, "[HCE_DIAG] APDU_RX len=" +
                (apdu == null ? 0 : apdu.length) +
                " data=" + HceDiagnostics.toHexLimited(apdu, 256));

        try {
            byte[] response;

            if (DalinPayProtocol.isSelectAid(apdu)) {
                aidSelected = true;
                HceDiagnostics.recordOurAidSelected(this);
                Log.i(TAG, "[HCE_DIAG] OUR_AID_SELECTED aid=" +
                        DalinPayProtocol.AID_HEX);

                JSONObject r = new JSONObject();
                r.put("protocol", "DALIN-PAY-NFC");
                r.put("version", DalinPayProtocol.PROTOCOL_VERSION);
                r.put("cardId", DalinPayProtocol.CARD_ID);
                r.put("ready", NfcPaymentSession.isReady());

                response = DalinPayProtocol.successJson(r.toString());
                return logAndReturn(response);
            }

            if (!aidSelected) {
                response = DalinPayProtocol.SW_FILE_NOT_FOUND;
                return logAndReturn(response);
            }

            if (apdu == null || apdu.length < 4) {
                response = DalinPayProtocol.SW_WRONG_LENGTH;
                return logAndReturn(response);
            }

            if (apdu[0] != DalinPayProtocol.CLA_DALIN) {
                response = DalinPayProtocol.SW_CLA_NOT_SUPPORTED;
                return logAndReturn(response);
            }

            byte ins = apdu[1];

            if (ins == DalinPayProtocol.INS_PING) {
                JSONObject r = new JSONObject();
                r.put("ok", true);
                r.put("protocol", "DALIN-PAY-NFC");
                r.put("version", DalinPayProtocol.PROTOCOL_VERSION);
                response = DalinPayProtocol.successJson(r.toString());
                return logAndReturn(response);
            }

            if (ins == DalinPayProtocol.INS_GET_STATUS) {
                JSONObject r = new JSONObject();
                r.put("ok", true);
                r.put("ready", NfcPaymentSession.isReady());
                r.put("remainingMs", NfcPaymentSession.remainingMs());
                response = DalinPayProtocol.successJson(r.toString());
                return logAndReturn(response);
            }

            if (ins == DalinPayProtocol.INS_REQUEST_PAYMENT) {
                if (!NfcPaymentSession.isReady()) {
                    response = DalinPayProtocol.SW_CONDITIONS_NOT_SATISFIED;
                    return logAndReturn(response);
                }

                byte[] payload = DalinPayProtocol.getData(apdu);
                if (payload == null) {
                    response = DalinPayProtocol.SW_WRONG_LENGTH;
                    return logAndReturn(response);
                }

                JSONObject request =
                        new JSONObject(new String(payload, StandardCharsets.UTF_8));

                String tx = request.optString("tx", "").trim();
                long amount = request.optLong("amount", -1L);
                String currency = request.optString("currency", "KRW").trim();

                if (tx.isEmpty() ||
                        tx.length() > 64 ||
                        amount <= 0L ||
                        amount > 99999999L ||
                        !"KRW".equals(currency)) {
                    response = DalinPayProtocol.SW_WRONG_DATA;
                    return logAndReturn(response);
                }

                if (!NfcPaymentSession.consume()) {
                    response = DalinPayProtocol.SW_CONDITIONS_NOT_SATISFIED;
                    return logAndReturn(response);
                }

                JSONObject r = new JSONObject();
                r.put("ok", true);
                r.put("status", "APPROVED");
                r.put("tx", tx);
                r.put("amount", amount);
                r.put("currency", currency);
                r.put("cardId", DalinPayProtocol.CARD_ID);

                notifyPaymentSuccess(tx, amount, currency);

                response = DalinPayProtocol.successJson(r.toString());
                return logAndReturn(response);
            }

            response = DalinPayProtocol.SW_INS_NOT_SUPPORTED;
            return logAndReturn(response);

        } catch (Exception e) {
            Log.e(TAG, "[HCE_DIAG] APDU processing failed", e);
            return logAndReturn(DalinPayProtocol.SW_WRONG_DATA);
        }
    }

    private byte[] logAndReturn(byte[] response) {
        HceDiagnostics.recordResponse(this, response);
        Log.i(TAG, "[HCE_DIAG] APDU_TX len=" +
                (response == null ? 0 : response.length) +
                " data=" + HceDiagnostics.toHexLimited(response, 256));
        return response;
    }

    private void notifyPaymentSuccess(String tx, long amount, String currency) {
        Intent i = new Intent(ACTION_PAYMENT_SUCCESS);
        i.setPackage(getPackageName());
        i.putExtra(EXTRA_TRANSACTION_ID, tx);
        i.putExtra(EXTRA_AMOUNT, amount);
        i.putExtra(EXTRA_CURRENCY, currency);
        sendBroadcast(i);
    }

    @Override
    public void onDeactivated(int reason) {
        HceDiagnostics.recordDeactivated(this, reason);
        Log.i(TAG, "[HCE_DIAG] DEACTIVATED reason=" + reason);
        aidSelected = false;
    }
}
