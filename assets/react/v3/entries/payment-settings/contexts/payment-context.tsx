import { LoadingSection } from '@TutorShared/atoms/LoadingSpinner';
import { type ReactNode, createContext, useContext } from 'react';
import {
  type PaymentGateway,
  type PaymentSettings,
  usePaymentGatewaysQuery,
  usePaymentSettingsQuery,
} from '../services/payment';

interface PaymentContextType {
  payment_gateways: PaymentGateway[];
  payment_settings: PaymentSettings | null;
  errorMessage?: string;
}

const PaymentContext = createContext<PaymentContextType>({
  payment_gateways: [],
  payment_settings: null,
  errorMessage: undefined,
});

export const usePaymentContext = () => useContext(PaymentContext);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const paymentGatewaysQuery = usePaymentGatewaysQuery();
  const paymentSettingsQuery = usePaymentSettingsQuery();

  if (paymentGatewaysQuery.isLoading || paymentSettingsQuery.isLoading) {
    return <LoadingSection />;
  }

  return (
    <PaymentContext.Provider
      value={{
        payment_gateways: paymentGatewaysQuery.data ?? [],
        payment_settings: paymentSettingsQuery.data ?? null,
        errorMessage: paymentGatewaysQuery.error?.response?.data?.message,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};
