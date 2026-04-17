import { toAppImageUrl } from "@/lib/imageUrl";

const DEFAULT_ITEM_WIDTH = 168;
const DEFAULT_ITEM_HEIGHT = 168;
const MAX_INITIAL_SIZE = 200;
const MIN_ITEM_SIZE = 72;

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function normalizeCanvasItemOrder(items) {
  return [...items]
    .sort((left, right) => {
      if (left.zIndex === right.zIndex) {
        return left.createdAt - right.createdAt;
      }

      return left.zIndex - right.zIndex;
    })
    .map((item, index) => ({
      ...item,
      zIndex: index + 1,
    }));
}

export function clampItemPosition(item, stageSize) {
  if (!stageSize.width || !stageSize.height) {
    return item;
  }

  const x = clamp(
    item.x,
    -item.width * 0.3,
    Math.max(stageSize.width - item.width * 0.7, 0)
  );
  const y = clamp(
    item.y,
    -item.height * 0.3,
    Math.max(stageSize.height - item.height * 0.7, 0)
  );

  return {
    ...item,
    x,
    y,
  };
}

export function createCanvasItemFromClosetItem(
  closetItem,
  insertionIndex,
  stageSize,
  droppedPosition
) {
  const safeWidth = stageSize.width || 760;
  const safeHeight = stageSize.height || 560;
  const sizeOffset = insertionIndex % 5;
  const width = clamp(
    DEFAULT_ITEM_WIDTH - sizeOffset * 8,
    MIN_ITEM_SIZE,
    MAX_INITIAL_SIZE
  );
  const height = clamp(
    DEFAULT_ITEM_HEIGHT + sizeOffset * 6,
    MIN_ITEM_SIZE,
    MAX_INITIAL_SIZE
  );
  const offset = 20 * (insertionIndex % 6);

  const nextItem = {
    instanceId:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `canvas-item-${Date.now()}-${insertionIndex}`,
    closetItemId: closetItem.id,
    imageUrl: toAppImageUrl(closetItem.image_url || ""),
    name: closetItem.name || "Closet item",
    category: closetItem.category || "uncategorized",
    x:
      droppedPosition?.x !== undefined
        ? droppedPosition.x - width / 2
        : Math.max((safeWidth - width) / 2 + offset, 24),
    y:
      droppedPosition?.y !== undefined
        ? droppedPosition.y - height / 2
        : Math.max((safeHeight - height) / 2 + offset * 0.7, 24),
    width,
    height,
    rotation: 0,
    zIndex: insertionIndex + 1,
    scaleX: 1,
    scaleY: 1,
    isLocked: false,
    createdAt: Date.now() + insertionIndex,
  };

  return clampItemPosition(nextItem, stageSize);
}

export function buildCanvasItemsFromOutfit(outfit) {
  const layoutByClosetItemId = new Map(
    (outfit?.canvas_layout || []).map((entry) => [entry.closet_item_id, entry])
  );

  return normalizeCanvasItemOrder(
    [...(outfit?.items || [])]
      .sort((left, right) => (left.position || 0) - (right.position || 0))
      .map((item, index) => {
        const closetItem = item.closet_item || {};
        const layout = layoutByClosetItemId.get(item.closet_item_id);
        const fallbackOffset = 18 * (index % 6);

        return {
          instanceId: `canvas-item-${item.closet_item_id}`,
          closetItemId: item.closet_item_id,
          imageUrl: toAppImageUrl(item.image_url || closetItem.image_url || ""),
          name: closetItem.name || "Closet item",
          category: closetItem.category || "uncategorized",
          x: layout?.x ?? 48 + fallbackOffset,
          y: layout?.y ?? 48 + fallbackOffset,
          width: layout?.width ?? DEFAULT_ITEM_WIDTH,
          height: layout?.height ?? DEFAULT_ITEM_HEIGHT,
          rotation: layout?.rotation ?? 0,
          zIndex: item.layer ?? layout?.position ?? item.position ?? index + 1,
          scaleX: layout?.scale_x ?? 1,
          scaleY: layout?.scale_y ?? 1,
          isLocked: false,
          createdAt: index + 1,
        };
      })
  );
}

export function buildOutfitSavePayload(formValues, canvasItems) {
  const orderedItems = normalizeCanvasItemOrder(canvasItems);

  return {
    apiPayload: {
      name: formValues.name.trim(),
      occasion: formValues.occasion || null,
      season: formValues.season || null,
      notes: formValues.notes.trim() || null,
      is_favorite: Boolean(formValues.is_favorite),
      items: orderedItems.map((item, index) => ({
        closet_item_id: item.closetItemId,
        position: index + 1,
        layer: item.zIndex,
        note: null,
      })),
      canvas_layout: orderedItems.map((item, index) => ({
        closet_item_id: item.closetItemId,
        position: index + 1,
        x: Math.round(item.x),
        y: Math.round(item.y),
        width: Math.round(item.width),
        height: Math.round(item.height),
        rotation: Math.round(item.rotation * 100) / 100,
        scale_x: item.scaleX,
        scale_y: item.scaleY,
      })),
    },
    builderSnapshot: {
      total_items: orderedItems.length,
      canvas: {
        width: null,
        height: null,
      },
      items: orderedItems.map((item, index) => ({
        instance_id: item.instanceId,
        closet_item_id: item.closetItemId,
        name: item.name,
        category: item.category,
        image_url: item.imageUrl || null,
        position: index + 1,
        layer: item.zIndex,
        transform: {
          x: Math.round(item.x),
          y: Math.round(item.y),
          width: Math.round(item.width),
          height: Math.round(item.height),
          rotation: Math.round(item.rotation * 100) / 100,
          scale_x: item.scaleX,
          scale_y: item.scaleY,
        },
      })),
    },
  };
}

export function dataUrlToFile(dataUrl, filename = "outfit-snapshot.png") {
  if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
    return null;
  }

  const [metadata, base64Data] = dataUrl.split(",");

  if (!metadata || !base64Data) {
    return null;
  }

  const mimeMatch = metadata.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || "image/png";
  const binaryString = atob(base64Data);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let index = 0; index < length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }

  return new File([bytes], filename, { type: mimeType });
}

export function buildOutfitSnapshotFilename(outfitName) {
  const sanitizedName = (outfitName || "outfit")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${sanitizedName || "outfit"}-snapshot.png`;
}
