"use client";
import { useState, useEffect, useCallback } from "react";
import PerspectiveGrid from "@/components/vaporwave/PerspectiveGrid";
import GlowCard from "@/components/vaporwave/GlowCard";
import SkewButton from "@/components/vaporwave/SkewButton";
import { useAuth } from "@/hooks/useAuth";
import { SKINS, getSkinById, type SkinDefinition, type SkinRarity } from "@/lib/skins/catalog";
import {
  getLocalCoins,
  setLocalCoins,
  getLocalOwnedSkins,
  addLocalOwnedSkin,
  getLocalActiveSkin,
  setLocalActiveSkin,
} from "@/lib/skins/localStore";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const RARITY_COLORS: Record<SkinRarity, string> = {
  common: "#888888",
  rare: "#00FFFF",
  epic: "#FF00FF",
  legendary: "#FF9900",
};

const RARITY_LABEL_KEYS: Record<SkinRarity, string> = {
  common: "shop.rarity.common",
  rare: "shop.rarity.rare",
  epic: "shop.rarity.epic",
  legendary: "shop.rarity.legendary",
};

const SKIN_NAME_KEYS: Record<string, string> = {
  classic: "skin.classic",
  neon_pulse: "skin.neon_pulse",
  pixel_art: "skin.pixel_art",
  holographic: "skin.holographic",
  fire_ice: "skin.fire_ice",
  glitch: "skin.glitch",
};

const SKIN_DESC_KEYS: Record<string, string> = {
  classic: "skin.classic.desc",
  neon_pulse: "skin.neon_pulse.desc",
  pixel_art: "skin.pixel_art.desc",
  holographic: "skin.holographic.desc",
  fire_ice: "skin.fire_ice.desc",
  glitch: "skin.glitch.desc",
};

function SkinPreviewDisc({ style, size = 48 }: { style: SkinDefinition["player1"]; size?: number }) {
  return (
    <div
      className={`${style.animation ?? ""}`}
      style={{
        width: size,
        height: size,
        background: style.background,
        boxShadow: style.boxShadow,
        borderRadius: style.borderRadius ?? "50%",
      }}
    />
  );
}

export default function ShopPage() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [coins, setCoins] = useState(0);
  const [ownedSkins, setOwnedSkins] = useState<string[]>(["classic"]);
  const [activeSkin, setActiveSkinState] = useState("classic");
  const [buying, setBuying] = useState<string | null>(null);

  // Load state from Supabase or localStorage
  useEffect(() => {
    if (profile) {
      setCoins(profile.coins ?? 0);
      setOwnedSkins(profile.owned_skins ?? ["classic"]);
      setActiveSkinState(profile.skin_id ?? "classic");
    } else {
      setCoins(getLocalCoins());
      setOwnedSkins(getLocalOwnedSkins());
      setActiveSkinState(getLocalActiveSkin());
    }
  }, [profile]);

  const buySkin = useCallback(
    async (skin: SkinDefinition) => {
      if (coins < skin.price) return;
      if (ownedSkins.includes(skin.id)) return;
      setBuying(skin.id);

      const newCoins = coins - skin.price;
      const newOwned = [...ownedSkins, skin.id];

      if (user) {
        try {
          const supabase = createClient();
          await supabase
            .from("profiles")
            .update({ coins: newCoins, owned_skins: newOwned })
            .eq("id", user.id);
        } catch {
          // fallback
        }
      }

      setLocalCoins(newCoins);
      addLocalOwnedSkin(skin.id);
      setCoins(newCoins);
      setOwnedSkins(newOwned);
      setBuying(null);
    },
    [coins, ownedSkins, user]
  );

  const equipSkin = useCallback(
    async (skinId: string) => {
      setActiveSkinState(skinId);
      setLocalActiveSkin(skinId);

      if (user) {
        try {
          const supabase = createClient();
          await supabase
            .from("profiles")
            .update({ skin_id: skinId })
            .eq("id", user.id);
        } catch {
          // fallback — already saved to localStorage
        }
      }
    },
    [user]
  );

  return (
    <div className="min-h-screen relative pt-20">
      <PerspectiveGrid />
      <div className="relative z-10 flex flex-col items-center py-8 px-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1
              className="font-heading font-black text-3xl"
              style={{
                color: "#FF00FF",
                fontFamily: "Orbitron, sans-serif",
                textShadow: "0 0 20px #FF00FF",
              }}
            >
              {t("shop.title")}
            </h1>
            <motion.div
              className="flex items-center gap-2 px-4 py-2"
              style={{
                background: "rgba(26, 16, 60, 0.9)",
                border: "1px solid #FF990055",
                boxShadow: "0 0 15px #FF990033",
              }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="text-xl">&#x1FA99;</span>
              <span
                className="font-heading font-bold text-xl"
                style={{ color: "#FF9900", fontFamily: "Orbitron, sans-serif" }}
              >
                {coins} NC
              </span>
            </motion.div>
          </div>

          {/* Skin grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SKINS.map((skin) => {
              const owned = ownedSkins.includes(skin.id);
              const active = activeSkin === skin.id;
              const canAfford = coins >= skin.price;
              const rarityColor = RARITY_COLORS[skin.rarity];

              return (
                <GlowCard
                  key={skin.id}
                  accentColor={skin.rarity === "epic" || skin.rarity === "legendary" ? "magenta" : "cyan"}
                  className="!p-5"
                >
                  {/* Rarity badge */}
                  <div className="flex justify-between items-center mb-4">
                    <span
                      className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5"
                      style={{
                        color: rarityColor,
                        border: `1px solid ${rarityColor}44`,
                        background: `${rarityColor}11`,
                      }}
                    >
                      {t(RARITY_LABEL_KEYS[skin.rarity])}
                    </span>
                    {skin.price > 0 && (
                      <span
                        className="font-mono text-xs font-bold"
                        style={{ color: "#FF9900" }}
                      >
                        {skin.price} NC
                      </span>
                    )}
                    {skin.price === 0 && (
                      <span className="font-mono text-xs text-[#E0E0E0]/40">
                        {t("shop.free")}
                      </span>
                    )}
                  </div>

                  {/* Preview discs */}
                  <div className="flex items-center justify-center gap-6 my-6">
                    <SkinPreviewDisc style={skin.player1} />
                    <span className="font-mono text-xs text-[#E0E0E0]/30">VS</span>
                    <SkinPreviewDisc style={skin.player2} />
                  </div>

                  {/* Name + description */}
                  <div className="text-center mb-4">
                    <div
                      className="font-heading font-bold text-lg mb-1"
                      style={{ fontFamily: "Orbitron, sans-serif", color: "#E0E0E0" }}
                    >
                      {t(SKIN_NAME_KEYS[skin.id] ?? skin.id)}
                    </div>
                    <div className="font-mono text-[11px] text-[#E0E0E0]/50 leading-relaxed">
                      {t(SKIN_DESC_KEYS[skin.id] ?? skin.id)}
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="flex justify-center">
                    {active ? (
                      <SkewButton
                        variant="outline"
                        disabled
                        className="!px-6 !py-2 !text-xs !opacity-60"
                      >
                        {t("shop.active")} &#x2713;
                      </SkewButton>
                    ) : owned ? (
                      <SkewButton
                        variant="secondary"
                        onClick={() => equipSkin(skin.id)}
                        className="!px-6 !py-2 !text-xs"
                      >
                        {t("shop.equip")}
                      </SkewButton>
                    ) : (
                      <SkewButton
                        variant="primary"
                        onClick={() => buySkin(skin)}
                        disabled={!canAfford || buying === skin.id}
                        className={`!px-6 !py-2 !text-xs ${!canAfford ? "!opacity-40" : ""}`}
                      >
                        {buying === skin.id
                          ? "..."
                          : canAfford
                            ? t("shop.buy")
                            : t("shop.need", { n: skin.price })}
                      </SkewButton>
                    )}
                  </div>
                </GlowCard>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
