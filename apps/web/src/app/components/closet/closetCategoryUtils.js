export function groupClosetItemsByCategory(allClosetItems = []) {
  return allClosetItems.reduce((accumulator, closetItem) => {
    const categoryName = closetItem?.category || "uncategorized";

    if (!accumulator[categoryName]) {
      accumulator[categoryName] = [];
    }

    accumulator[categoryName].push(closetItem);
    return accumulator;
  }, {});
}
