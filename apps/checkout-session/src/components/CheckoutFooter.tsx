export function CheckoutFooter() {
  return (
    <div className="max-w-[480px] w-full mx-auto px-6 pb-6 flex items-center gap-3 text-xs text-gray-400">
      <span>Powered by <span className="font-semibold text-gray-500">Revolv3</span></span>
      <span className="text-gray-300">|</span>
      <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
      <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
    </div>
  );
}
