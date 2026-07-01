import { create } from "zustand";
import { persist } from "zustand/middleware";

type DeliveryMethod = "pickup" | "delivery";

interface CartMetaState {
  deliveryMethod: DeliveryMethod;
  zoneId: string | null;
  couponCode: string;
  setDelivery: (method: DeliveryMethod, zoneId: string | null | undefined) => void;
  setCoupon: (code: string) => void;
  reset: () => void;
}

export const useCartMeta = create<CartMetaState>()(
  persist(
    (set) => ({
      deliveryMethod: "pickup",
      zoneId: null,
      couponCode: "",
      setDelivery: (method, zoneId) => set({ deliveryMethod: method, zoneId: zoneId ?? null }),
      setCoupon: (code) => set({ couponCode: code }),
      reset: () => set({ deliveryMethod: "pickup", zoneId: null, couponCode: "" }),
    }),
    { name: "sc-cart-meta" },
  ),
);