const itemClassification = {
  progression: "progressiveItem",
  useful: "usefulItem",
  filler: "normalItem",
  trap: "trapItem",
};

function getItemType(flag: number) {
  switch (flag) {
    case 1:
      return itemClassification.progression;
    case 2:
      return itemClassification.useful;
    case 4:
      return itemClassification.trap;
    default:
      return itemClassification.filler;
  }
}
export default getItemType;
