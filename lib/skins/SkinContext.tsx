"use client";
import { createContext, useContext } from "react";
import { getSkinById, type SkinDefinition } from "./catalog";

const SkinContext = createContext<SkinDefinition>(getSkinById("classic"));

export const useSkin = () => useContext(SkinContext);

export function SkinProvider({
  skinId,
  children,
}: {
  skinId: string;
  children: React.ReactNode;
}) {
  return (
    <SkinContext.Provider value={getSkinById(skinId)}>
      {children}
    </SkinContext.Provider>
  );
}
