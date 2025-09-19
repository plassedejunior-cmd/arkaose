import {
  signoTropical,
  chaosSignFromBuckets,
  rangeInfo,
  composeDualTraitsMessage,
  phraseByIdx,
  adviceByIdx,
} from "./chaosLogic";

export function buildResultData({ dob, cached, already }) {
  const st = signoTropical(dob);
  const { signo: sc, casas } = chaosSignFromBuckets(st, cached.chaosNum);
  const combo = composeDualTraitsMessage(st, sc, casas, dob);
  const badge = rangeInfo(cached.chaosNum);

  return {
    alreadyMsg: already
      ? "Voce ja mediu o seu caos hoje. O caos se acalma a meia-noite."
      : "",
    bigCounter: String(cached.chaosNum),
    rangeBadge: { key: badge.key, label: badge.label },
    rangeDesc: badge.blurb,
    inflMsg: combo.message,
    signoTrad: st,
    signoChaos: sc,
    traits: cached.traits,
    fortune: phraseByIdx(cached.phraseIdx),
    advice: adviceByIdx(cached.phraseIdx + cached.chaosNum),
  };
}