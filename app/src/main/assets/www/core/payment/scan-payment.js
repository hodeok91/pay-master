import {
  parseMerchantQr,
  debitBalance,
  formatMoney
} from "../wallet/wallet-store.js";

export function installQrResultHandler({
  provider,
  onSuccess,
  onFailure
}){
  window.PayMasterQrScanResult = raw => {
    if(!raw){
      onFailure?.("CANCELLED", "스캔을 취소했습니다.");
      return;
    }

    const parsed = parseMerchantQr(raw);

    if(!parsed.ok){
      onFailure?.(
        parsed.reason,
        "페이의 달인용 교육 QR이 아닙니다."
      );
      return;
    }

    const result = debitBalance(
      parsed.amount,
      {
        txId: parsed.txId,
        memo: parsed.merchant,
        provider,
        method: "qr-scan"
      }
    );

    if(!result.ok){
      onFailure?.(
        result.reason,
        `잔액이 부족합니다. 현재 잔액 ${formatMoney(result.wallet.balance)}`
      );
      return;
    }

    onSuccess?.({
      ...parsed,
      wallet: result.wallet
    });
  };

  return () => {
    window.PayMasterQrScanResult = null;
  };
}
