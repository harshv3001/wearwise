export const closetQueryKeys = {
  all: ["closet-items"],
  lists: () => [...closetQueryKeys.all, "list"],
  list: (category = "") => [...closetQueryKeys.lists(), category],
  details: () => [...closetQueryKeys.all, "detail"],
  detail: (itemId) => [...closetQueryKeys.details(), itemId],
};
