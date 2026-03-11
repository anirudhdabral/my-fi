"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";

type Props = {
  snippets: string[];
};

const FadedCard = ({ side }: { side: "left" | "right" }) => {
  const direction = side === "left" ? "right" : "left";

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`faded-${side}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card
          variant="outlined"
          sx={{
            display: { xs: "none", md: "block" },
            p: 0.9,
            borderRadius: 1.5,
            filter: "saturate(0.7)",
            pointerEvents: "none",
            width: 50,
            maskImage: `linear-gradient(to ${direction}, transparent, black)`,
            WebkitMaskImage: `linear-gradient(to ${direction}, transparent, black)`,
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default function TextSnippetCarousel({ snippets }: Props) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    setActiveIndex(0);
  }, [snippets.length]);

  const goNext = () => {
    if (!snippets.length) return;
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % snippets.length);
  };

  const goPrev = () => {
    if (!snippets.length) return;
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + snippets.length) % snippets.length);
  };

  const handleSwipeEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (isDesktop || snippets.length <= 1) return;

    const swipeDistance = info.offset.x;
    const swipeVelocity = info.velocity.x;
    const passedDistance = Math.abs(swipeDistance) > 45;
    const passedVelocity = Math.abs(swipeVelocity) > 450;

    if (!passedDistance && !passedVelocity) return;

    if (swipeDistance < 0) {
      goNext();
      return;
    }
    goPrev();
  };

  if (!snippets.length) {
    return null;
  }

  const currentSnippet = snippets[activeIndex];
  const prevSnippet =
    snippets[(activeIndex - 1 + snippets.length) % snippets.length];
  const nextSnippet = snippets[(activeIndex + 1) % snippets.length];

  return (
    <Box sx={{ mb: 2 }}>
      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {isDesktop && snippets.length > 1 && (
            <IconButton
              size="small"
              aria-label="Previous snippets"
              onClick={goPrev}
              sx={{ flexShrink: 0 }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          )}

          <Box sx={{ display: "flex", flex: 1, minWidth: 0, gap: 1 }}>
            {snippets.length > 1 && (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      display: { xs: "none", md: "block" },
                      p: 0.9,
                      borderRadius: 1.5,
                      filter: "saturate(0.7)",
                      pointerEvents: "none",
                      width: 50,
                      height:90,
                      maskImage: `linear-gradient(to right, transparent, black)`,
                      WebkitMaskImage: `linear-gradient(to right, transparent, black)`,
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            )}
            <Box
              sx={{
                width: "100%",
                maxWidth: "100%",
                height: 94,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 16 * direction }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 * direction }}
                  transition={{ duration: 0.25 }}
                  drag={!isDesktop && snippets.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragEnd={handleSwipeEnd}
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 2,
                    touchAction: "pan-y",
                  }}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      width: "100%",
                      height:90,
                      p: { xs: 0.75, md: 1 },
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        textAlign: "center",
                        fontWeight: 600,
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        overflow: "hidden",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        px: 1,
                      }}
                    >
                      {currentSnippet}
                    </Typography>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </Box>
            {snippets.length > 1 && (
             <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      display: { xs: "none", md: "block" },
                      p: 0.9,
                      borderRadius: 1.5,
                      filter: "saturate(0.7)",
                      pointerEvents: "none",
                      width: 50,
                      height:90,
                      maskImage: `linear-gradient(to left, transparent, black)`,
                      WebkitMaskImage: `linear-gradient(to left, transparent, black)`,
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            )}
          </Box>

          {isDesktop && snippets.length > 1 && (
            <IconButton
              size="small"
              aria-label="Next snippets"
              onClick={goNext}
              sx={{ flexShrink: 0 }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        {snippets.length > 1 && (
          <Stack direction="row" justifyContent="center" spacing={0.75}>
            {snippets.map((snippet, index) => (
              <Box
                key={`${snippet}-${index}`}
                onClick={() => setActiveIndex(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveIndex(index);
                  }
                }}
                sx={{
                  width: index === activeIndex ? 18 : 6,
                  height: 6,
                  borderRadius: 999,
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  bgcolor:
                    index === activeIndex ? "primary.main" : "action.disabled",
                }}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
