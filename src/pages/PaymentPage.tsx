import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Smartphone, ArrowLeft, Loader2, ChevronRight } from 'lucide-react';
import QRCode from 'qrcode';
import { usePlan } from '../contexts/PlanContext';
import { createPayment, type PaymentMethod } from '../services/paymentService';
import { PulsingOrbsBackground } from '../components/PulsingOrbsBackground';

const PREMIUM_PRICE = 1600;

type Step = 'method' | 'details';

const formatCardNumber = (value: string) => {
  const v = value.replace(/\D/g, '').slice(0, 16);
  return v.replace(/(\d{4})(?=\d)/g, '$1 ');
};

const formatExpiry = (value: string) => {
  const v = value.replace(/\D/g, '').slice(0, 4);
  if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2);
  return v;
};

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = (searchParams.get('plan') || 'premium') as string;
  const { refreshPlan } = usePlan();
  const [step, setStep] = useState<Step>('method');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Карта
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [holder, setHolder] = useState('');
  // СБП QR
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (paymentMethod === 'sbp' && step === 'details') {
      const payload = `SBP_DEMO|${PREMIUM_PRICE}|RUB|Премиум подписка`;
      QRCode.toDataURL(payload, { width: 220, margin: 2 }).then(setQrDataUrl).catch(() => setQrDataUrl(null));
    }
  }, [paymentMethod, step]);

  const goNext = () => {
    if (!paymentMethod) return;
    setError(null);
    setStep('details');
  };

  const goBack = () => {
    setError(null);
    setStep('method');
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setHolder('');
  };

  const handlePay = async () => {
    if (!paymentMethod || plan !== 'premium') return;
    if (paymentMethod === 'card') {
      const num = cardNumber.replace(/\s/g, '');
      if (num.length < 16) {
        setError('Введите номер карты (16 цифр)');
        return;
      }
      if (expiry.replace(/\D/g, '').length < 4) {
        setError('Введите срок действия (ММ/ГГ)');
        return;
      }
      if (cvv.length < 3) {
        setError('Введите CVV (3 цифры)');
        return;
      }
      if (!holder.trim()) {
        setError('Введите имя владельца карты');
        return;
      }
    }
    setLoading(true);
    setError(null);
    const { transaction, error: err } = await createPayment('premium', paymentMethod);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    if (transaction) {
      await refreshPlan();
      navigate('/account', { state: { paymentSuccess: true } });
    }
  };

  return (
    <div className="relative min-h-screen bg-background-darker">
      <PulsingOrbsBackground />
      <div className="relative z-10 max-w-lg mx-auto px-4 py-12">
        <button
          type="button"
          onClick={() => (step === 'details' ? goBack() : navigate('/pricing'))}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 'details' ? 'Назад' : 'Назад к тарифам'}
        </button>

        <h1 className="text-2xl font-bold text-white mb-2">Оплата подписки</h1>
        <p className="text-gray-400 mb-8">
          {step === 'method' ? 'Выберите способ оплаты' : paymentMethod === 'card' ? 'Введите данные карты' : 'Отсканируйте QR-код в приложении банка или нажмите «Оплатить»'}
        </p>

        <div className="bg-background-card border border-primary-900/30 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <span className="text-white font-medium">Премиум</span>
            <span className="text-xl font-bold text-white">{PREMIUM_PRICE} ₽</span>
          </div>

          {step === 'method' && (
            <>
              <p className="text-sm text-gray-400 mb-4">Способ оплаты</p>
              <div className="space-y-3">
                <label className="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors bg-background-darker border-white/10 hover:border-primary-500/50 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-500/10">
                  <input
                    type="radio"
                    name="method"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="sr-only peer"
                  />
                  <CreditCard className="w-6 h-6 text-primary-400" />
                  <span className="text-white font-medium">Банковская карта</span>
                </label>
                <label className="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors bg-background-darker border-white/10 hover:border-primary-500/50 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-500/10">
                  <input
                    type="radio"
                    name="method"
                    value="sbp"
                    checked={paymentMethod === 'sbp'}
                    onChange={() => setPaymentMethod('sbp')}
                    className="sr-only peer"
                  />
                  <Smartphone className="w-6 h-6 text-primary-400" />
                  <span className="text-white font-medium">СБП (Система быстрых платежей)</span>
                </label>
              </div>
              <button
                type="button"
                onClick={goNext}
                disabled={!paymentMethod}
                className="w-full mt-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                Далее
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {step === 'details' && paymentMethod === 'card' && (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Номер карты</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-background-darker border border-white/10 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Срок действия (ММ/ГГ)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-background-darker border border-white/10 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">CVV</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="123"
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full px-4 py-3 rounded-xl bg-background-darker border border-white/10 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Имя владельца карты</label>
                  <input
                    type="text"
                    placeholder="IVAN IVANOV"
                    value={holder}
                    onChange={(e) => setHolder(e.target.value.toUpperCase().slice(0, 50))}
                    className="w-full px-4 py-3 rounded-xl bg-background-darker border border-white/10 text-white placeholder-gray-500 focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                  {error}
                </div>
              )}
              <button
                type="button"
                onClick={handlePay}
                disabled={loading}
                className="w-full mt-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  `Оплатить ${PREMIUM_PRICE} ₽`
                )}
              </button>
            </>
          )}

          {step === 'details' && paymentMethod === 'sbp' && (
            <>
              <div className="flex flex-col items-center py-4">
                <div className="bg-white p-3 rounded-xl inline-block">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR СБП" className="w-[220px] h-[220px]" />
                  ) : (
                    <div className="w-[220px] h-[220px] bg-gray-200 rounded flex items-center justify-center">
                      <Loader2 className="w-10 h-10 animate-spin text-gray-500" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-4 text-center">
                  Откройте приложение банка и отсканируйте QR-код
                </p>
              </div>
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                  {error}
                </div>
              )}
              <button
                type="button"
                onClick={handlePay}
                disabled={loading}
                className="w-full mt-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  `Оплатить ${PREMIUM_PRICE} ₽`
                )}
              </button>
            </>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center">
          Оплата условная (демо). План Премиум будет активирован после нажатия кнопки.
        </p>
      </div>
    </div>
  );
};
