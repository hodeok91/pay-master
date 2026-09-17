package kr.dalin.paymaster.nfc;

import android.content.Intent;
import android.nfc.cardemulation.HostApduService;
import android.os.Bundle;
import android.util.Log;
import org.json.JSONObject;
import java.nio.charset.StandardCharsets;

public class DalinHostApduService extends HostApduService {
    public static final String ACTION_PAYMENT_SUCCESS="kr.dalin.paymaster.action.NFC_PAYMENT_SUCCESS";
    public static final String EXTRA_TRANSACTION_ID="transactionId";
    public static final String EXTRA_AMOUNT="amount";
    public static final String EXTRA_CURRENCY="currency";
    private static final String TAG="DalinPayHCE";
    private boolean aidSelected=false;

    @Override
    public byte[] processCommandApdu(byte[] apdu, Bundle extras){
        try{
            if(DalinPayProtocol.isSelectAid(apdu)){
                aidSelected=true;
                JSONObject r=new JSONObject();
                r.put("protocol","DALIN-PAY-NFC");
                r.put("version",DalinPayProtocol.PROTOCOL_VERSION);
                r.put("cardId",DalinPayProtocol.CARD_ID);
                r.put("ready",NfcPaymentSession.isReady());
                return DalinPayProtocol.successJson(r.toString());
            }
            if(!aidSelected) return DalinPayProtocol.SW_FILE_NOT_FOUND;
            if(apdu==null || apdu.length<4) return DalinPayProtocol.SW_WRONG_LENGTH;
            if(apdu[0]!=DalinPayProtocol.CLA_DALIN) return DalinPayProtocol.SW_CLA_NOT_SUPPORTED;

            byte ins=apdu[1];
            if(ins==DalinPayProtocol.INS_PING){
                JSONObject r=new JSONObject();
                r.put("ok",true); r.put("protocol","DALIN-PAY-NFC"); r.put("version",1);
                return DalinPayProtocol.successJson(r.toString());
            }
            if(ins==DalinPayProtocol.INS_GET_STATUS){
                JSONObject r=new JSONObject();
                r.put("ok",true); r.put("ready",NfcPaymentSession.isReady()); r.put("remainingMs",NfcPaymentSession.remainingMs());
                return DalinPayProtocol.successJson(r.toString());
            }
            if(ins==DalinPayProtocol.INS_REQUEST_PAYMENT){
                if(!NfcPaymentSession.isReady()) return DalinPayProtocol.SW_CONDITIONS_NOT_SATISFIED;
                byte[] payload=DalinPayProtocol.getData(apdu);
                if(payload==null) return DalinPayProtocol.SW_WRONG_LENGTH;
                JSONObject request=new JSONObject(new String(payload,StandardCharsets.UTF_8));
                String tx=request.optString("tx","").trim();
                long amount=request.optLong("amount",-1L);
                String currency=request.optString("currency","KRW").trim();
                if(tx.isEmpty() || tx.length()>64 || amount<=0L || amount>99999999L || !"KRW".equals(currency)) return DalinPayProtocol.SW_WRONG_DATA;
                if(!NfcPaymentSession.consume()) return DalinPayProtocol.SW_CONDITIONS_NOT_SATISFIED;

                JSONObject r=new JSONObject();
                r.put("ok",true); r.put("status","APPROVED"); r.put("tx",tx); r.put("amount",amount); r.put("currency",currency); r.put("cardId",DalinPayProtocol.CARD_ID);
                notifyPaymentSuccess(tx,amount,currency);
                return DalinPayProtocol.successJson(r.toString());
            }
            return DalinPayProtocol.SW_INS_NOT_SUPPORTED;
        }catch(Exception e){
            Log.e(TAG,"APDU processing failed",e);
            return DalinPayProtocol.SW_WRONG_DATA;
        }
    }

    private void notifyPaymentSuccess(String tx,long amount,String currency){
        Intent i=new Intent(ACTION_PAYMENT_SUCCESS);
        i.setPackage(getPackageName());
        i.putExtra(EXTRA_TRANSACTION_ID,tx);
        i.putExtra(EXTRA_AMOUNT,amount);
        i.putExtra(EXTRA_CURRENCY,currency);
        sendBroadcast(i);
    }

    @Override
    public void onDeactivated(int reason){ aidSelected=false; }
}
