"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Stage, Layer, Group, Image as KonvaImage, Rect, Text, Circle, Line, Transformer } from "react-konva";
import styles from "./OutfitCanvas.module.scss";

function createImageLoader(imageUrl, onLoad, onError) {
  const image = new window.Image();
  image.crossOrigin = "anonymous";
  image.onload = () => onLoad(image);
  image.onerror = onError;
  image.src = imageUrl;
}

export default function OutfitCanvas({
  canvasItems,
  selectedItemId,
  onSelectItem,
  onClearSelection,
  onUpdateItem,
  onRemoveItem,
  onStageSizeChange,
  onDropItem,
  snapshotRequestId,
  onSnapshotReady,
}) {
  const stageShellRef = useRef(null);
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const itemNodeMapRef = useRef({});
  const requestedImagesRef = useRef({});
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [loadedImages, setLoadedImages] = useState({});

  useEffect(() => {
    if (!stageShellRef.current) return undefined;

    const element = stageShellRef.current;

    const syncStageSize = () => {
      const nextSize = {
        width: Math.round(element.clientWidth),
        height: Math.round(element.clientHeight),
      };

      setStageSize(nextSize);
      onStageSizeChange?.(nextSize);
    };

    syncStageSize();

    const resizeObserver = new ResizeObserver(syncStageSize);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [onStageSizeChange]);

  useEffect(() => {
    const activeIds = new Set(canvasItems.map((item) => item.instanceId));

    Object.keys(requestedImagesRef.current).forEach((instanceId) => {
      if (!activeIds.has(instanceId)) {
        delete requestedImagesRef.current[instanceId];
      }
    });

    canvasItems.forEach((item) => {
      if (
        !item.imageUrl ||
        requestedImagesRef.current[item.instanceId] === item.imageUrl
      ) {
        return;
      }

      requestedImagesRef.current[item.instanceId] = item.imageUrl;

      createImageLoader(
        item.imageUrl,
        (image) => {
          setLoadedImages((previous) => ({
            ...previous,
            [item.instanceId]: {
              image,
              src: item.imageUrl,
              failed: false,
            },
          }));
        },
        () => {
          setLoadedImages((previous) => ({
            ...previous,
            [item.instanceId]: {
              image: null,
              src: item.imageUrl,
              failed: true,
            },
          }));
        }
      );
    });
  }, [canvasItems]);

  useEffect(() => {
    if (!transformerRef.current) return;

    const node = itemNodeMapRef.current[selectedItemId];

    if (node) {
      transformerRef.current.nodes([node]);
    } else {
      transformerRef.current.nodes([]);
    }

    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedItemId, canvasItems]);

  useEffect(() => {
    if (!snapshotRequestId || !stageRef.current || !onSnapshotReady) {
      return;
    }

    if (stageSize.width <= 0 || stageSize.height <= 0 || canvasItems.length === 0) {
      onSnapshotReady("");
      return;
    }

    const stage = stageRef.current;
    const transformer = transformerRef.current;
    const previousNodes = transformer?.nodes?.() || [];

    if (transformer) {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      try {
        const itemRects = canvasItems
          .map((item) => itemNodeMapRef.current[item.instanceId])
          .filter(Boolean)
          .map((node) => node.getClientRect({ relativeTo: stage }));

        const padding = 36;
        const minX = Math.min(...itemRects.map((rect) => rect.x));
        const minY = Math.min(...itemRects.map((rect) => rect.y));
        const maxX = Math.max(...itemRects.map((rect) => rect.x + rect.width));
        const maxY = Math.max(...itemRects.map((rect) => rect.y + rect.height));

        const exportX = Math.max(0, minX - padding);
        const exportY = Math.max(0, minY - padding);
        const exportWidth = Math.min(
          stageSize.width - exportX,
          Math.max(maxX - minX + padding * 2, 1)
        );
        const exportHeight = Math.min(
          stageSize.height - exportY,
          Math.max(maxY - minY + padding * 2, 1)
        );

        const snapshot = stage.toDataURL({
          x: exportX,
          y: exportY,
          width: exportWidth,
          height: exportHeight,
          pixelRatio: 2,
          mimeType: "image/png",
        });
        onSnapshotReady(snapshot);
      } catch {
        onSnapshotReady("");
      } finally {
        if (transformer) {
          transformer.nodes(previousNodes);
          transformer.getLayer()?.batchDraw();
        }
      }
    });

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [
    snapshotRequestId,
    onSnapshotReady,
    canvasItems.length,
    stageSize.height,
    stageSize.width,
  ]);

  const orderedItems = useMemo(
    () => [...canvasItems].sort((left, right) => left.zIndex - right.zIndex),
    [canvasItems]
  );

  const handleStageMouseDown = (event) => {
    const clickedOnEmptyStage = event.target === event.target.getStage();
    if (clickedOnEmptyStage) {
      onClearSelection();
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();

    let closetItem;

    try {
      closetItem = JSON.parse(
        event.dataTransfer.getData("application/x-wearwise-closet-item")
      );
    } catch {
      closetItem = null;
    }

    if (!closetItem?.id || !stageShellRef.current) {
      return;
    }

    const rect = stageShellRef.current.getBoundingClientRect();
    onDropItem(closetItem, {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  return (
    <section className={styles.section}>
      <div
        ref={stageShellRef}
        className={styles.stageShell}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className={styles.stageOverlay} />

        {stageSize.width > 0 && stageSize.height > 0 ? (
          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            onMouseDown={handleStageMouseDown}
            onTouchStart={handleStageMouseDown}
          >
            <Layer>
              {orderedItems.map((item) => {
                const imageAsset = loadedImages[item.instanceId];
                const showDelete = hoveredItemId === item.instanceId;

                return (
                  <Group
                    key={item.instanceId}
                    x={item.x}
                    y={item.y}
                    rotation={item.rotation}
                    draggable
                    ref={(node) => {
                      if (node) {
                        itemNodeMapRef.current[item.instanceId] = node;
                      } else {
                        delete itemNodeMapRef.current[item.instanceId];
                      }
                    }}
                    dragBoundFunc={(position) => ({
                      x: Math.min(
                        Math.max(position.x, -item.width * 0.25),
                        Math.max(stageSize.width - item.width * 0.75, 0)
                      ),
                      y: Math.min(
                        Math.max(position.y, -item.height * 0.25),
                        Math.max(stageSize.height - item.height * 0.75, 0)
                      ),
                    })}
                    onClick={() => onSelectItem(item.instanceId)}
                    onTap={() => onSelectItem(item.instanceId)}
                    onMouseEnter={() => setHoveredItemId(item.instanceId)}
                    onMouseLeave={() =>
                      setHoveredItemId((previous) =>
                        previous === item.instanceId ? null : previous
                      )
                    }
                    onDragStart={() => onSelectItem(item.instanceId)}
                    onDragEnd={(event) =>
                      onUpdateItem(
                        item.instanceId,
                        {
                          x: event.target.x(),
                          y: event.target.y(),
                        },
                        stageSize
                      )
                    }
                    onTransformEnd={(event) => {
                      const node = event.target;
                      const scaleX = node.scaleX();
                      const scaleY = node.scaleY();

                      node.scaleX(1);
                      node.scaleY(1);

                      onUpdateItem(
                        item.instanceId,
                        {
                          x: node.x(),
                          y: node.y(),
                          rotation: node.rotation(),
                          width: Math.max(72, item.width * scaleX),
                          height: Math.max(72, item.height * scaleY),
                          scaleX: 1,
                          scaleY: 1,
                        },
                        stageSize
                      );
                    }}
                  >
                    <Rect
                      width={item.width}
                      height={item.height}
                      fill="rgba(0,0,0,0.001)"
                    />

                    {imageAsset?.image ? (
                      <KonvaImage
                        image={imageAsset.image}
                        width={item.width}
                        height={item.height}
                      />
                    ) : (
                      <>
                        <Rect
                          width={item.width}
                          height={item.height}
                          fill="#fffaf8"
                          stroke="#e4cfc8"
                          cornerRadius={18}
                          shadowBlur={12}
                          shadowColor="rgba(199, 161, 150, 0.18)"
                        />
                        <Text
                          text={item.name}
                          width={item.width}
                          height={item.height}
                          align="center"
                          verticalAlign="middle"
                          fontSize={18}
                          fill="#8a6a63"
                          padding={18}
                          listening={false}
                        />
                      </>
                    )}

                    {showDelete ? (
                      <Group
                        x={item.width - 10}
                        y={10}
                        onMouseDown={(event) => event.cancelBubble = true}
                        onClick={(event) => {
                          event.cancelBubble = true;
                          onRemoveItem(item.instanceId);
                        }}
                        onTap={(event) => {
                          event.cancelBubble = true;
                          onRemoveItem(item.instanceId);
                        }}
                      >
                        <Circle
                          radius={12}
                          fill="#ffffff"
                          stroke="#de8f7d"
                          strokeWidth={1.2}
                          shadowBlur={8}
                          shadowColor="rgba(182, 125, 109, 0.22)"
                        />
                        <Line
                          points={[-4, -4, 4, 4]}
                          stroke="#c86f5c"
                          strokeWidth={1.8}
                          lineCap="round"
                        />
                        <Line
                          points={[-4, 4, 4, -4]}
                          stroke="#c86f5c"
                          strokeWidth={1.8}
                          lineCap="round"
                        />
                      </Group>
                    ) : null}
                  </Group>
                );
              })}

              <Transformer
                ref={transformerRef}
                rotateEnabled
                keepRatio
                enabledAnchors={[
                  "top-left",
                  "top-right",
                  "bottom-left",
                  "bottom-right",
                ]}
                borderStroke="#d78674"
                borderStrokeWidth={1.4}
                anchorSize={10}
                anchorFill="#ffffff"
                anchorStroke="#d78674"
                anchorStrokeWidth={1.4}
                boundBoxFunc={(oldBox, newBox) => {
                  if (Math.abs(newBox.width) < 72 || Math.abs(newBox.height) < 72) {
                    return oldBox;
                  }

                  return newBox;
                }}
              />
            </Layer>
          </Stage>
        ) : null}
      </div>
    </section>
  );
}
