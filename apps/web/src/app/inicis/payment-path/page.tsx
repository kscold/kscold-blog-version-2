import { permanentRedirect } from 'next/navigation';

export default function LegacyCardPaymentPathPage() {
  permanentRedirect('/kakaopay/payment-path');
}
