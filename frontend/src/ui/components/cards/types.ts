export const CardTypes = {
  libraryPluginCard: "libraryPluginCard",
  chainCard: "chainCard",
} as const;

export type CardType = (typeof CardTypes)[keyof typeof CardTypes];

export type CardDimension = {
  width: number;
  height: number;
};
