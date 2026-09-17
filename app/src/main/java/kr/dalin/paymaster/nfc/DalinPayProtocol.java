package kr.dalin.paymaster.nfc;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

public final class DalinPayProtocol {
    private DalinPayProtocol() {}

    public static final int PROTOCOL_VERSION = 1;
    public static final String AID_HEX = "F044414C494E0101";
    public static final byte[] AID = hexToBytes(AID_HEX);
    public static final byte CLA_DALIN = (byte) 0x80;
    public static final byte INS_PING = (byte) 0x01;
    public static final byte INS_GET_STATUS = (byte) 0x10;
    public static final byte INS_REQUEST_PAYMENT = (byte) 0x20;
    public static final byte[] SW_OK = new byte[]{(byte)0x90,(byte)0x00};
    public static final byte[] SW_WRONG_LENGTH = new byte[]{(byte)0x67,(byte)0x00};
    public static final byte[] SW_CONDITIONS_NOT_SATISFIED = new byte[]{(byte)0x69,(byte)0x85};
    public static final byte[] SW_WRONG_DATA = new byte[]{(byte)0x6A,(byte)0x80};
    public static final byte[] SW_FILE_NOT_FOUND = new byte[]{(byte)0x6A,(byte)0x82};
    public static final byte[] SW_INS_NOT_SUPPORTED = new byte[]{(byte)0x6D,(byte)0x00};
    public static final byte[] SW_CLA_NOT_SUPPORTED = new byte[]{(byte)0x6E,(byte)0x00};
    public static final String CARD_ID = "DALIN-EDU-01";

    public static boolean isSelectAid(byte[] apdu){
        if(apdu==null || apdu.length<5) return false;
        if((apdu[0]&0xFF)!=0x00 || (apdu[1]&0xFF)!=0xA4 || (apdu[2]&0xFF)!=0x04 || (apdu[3]&0xFF)!=0x00) return false;
        int lc=apdu[4]&0xFF;
        if(lc!=AID.length || apdu.length<5+lc) return false;
        return Arrays.equals(Arrays.copyOfRange(apdu,5,5+lc),AID);
    }

    public static byte[] getData(byte[] apdu){
        if(apdu==null || apdu.length<5) return new byte[0];
        int lc=apdu[4]&0xFF;
        if(apdu.length<5+lc) return null;
        return Arrays.copyOfRange(apdu,5,5+lc);
    }

    public static byte[] successJson(String json){
        return concat(json.getBytes(StandardCharsets.UTF_8),SW_OK);
    }

    public static byte[] concat(byte[] a, byte[] b){
        byte[] out=new byte[a.length+b.length];
        System.arraycopy(a,0,out,0,a.length);
        System.arraycopy(b,0,out,a.length,b.length);
        return out;
    }

    public static byte[] hexToBytes(String hex){
        byte[] out=new byte[hex.length()/2];
        for(int i=0;i<hex.length();i+=2){
            out[i/2]=(byte)((Character.digit(hex.charAt(i),16)<<4)+Character.digit(hex.charAt(i+1),16));
        }
        return out;
    }
}
