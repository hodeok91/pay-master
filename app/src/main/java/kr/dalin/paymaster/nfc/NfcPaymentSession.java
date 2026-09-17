package kr.dalin.paymaster.nfc;

import android.os.SystemClock;

public final class NfcPaymentSession {
    private static boolean armed=false;
    private static boolean consumed=false;
    private static long expiresAtElapsed=0L;
    private NfcPaymentSession(){}

    public static synchronized void arm(long durationMs){
        long safe=Math.max(1000L,Math.min(durationMs,120000L));
        armed=true;
        consumed=false;
        expiresAtElapsed=SystemClock.elapsedRealtime()+safe;
    }

    public static synchronized void disarm(){
        armed=false;
        consumed=false;
        expiresAtElapsed=0L;
    }

    public static synchronized boolean isReady(){
        if(!armed || consumed) return false;
        if(SystemClock.elapsedRealtime()>=expiresAtElapsed){
            armed=false;
            return false;
        }
        return true;
    }

    public static synchronized long remainingMs(){
        if(!isReady()) return 0L;
        return Math.max(0L,expiresAtElapsed-SystemClock.elapsedRealtime());
    }

    public static synchronized boolean consume(){
        if(!isReady()) return false;
        consumed=true;
        armed=false;
        return true;
    }
}
