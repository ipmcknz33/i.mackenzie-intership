import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

import "../../css/styles/skeleton.css";
import AuthorImageFallback from "../../images/author_thumbnail.jpg";

const NEW_ITEMS_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/newItems";


function WheelControls(slider) {
  function wheelHandler(e) {
    e.preventDefault();
    const delta = e.deltaY;
    if (delta > 0) slider.next();
    if (delta < 0) slider.prev();
  }

  slider.on("created", () => {
    slider.container.addEventListener("wheel", wheelHandler, {
      passive: false,
    });
  });

  slider.on("destroyed", () => {
    slider.container.removeEventListener("wheel", wheelHandler);
  });
}


function getItemId(item, index) {
  return item?.nftId ?? item?.id ?? item?._id ?? item?.tokenId ?? index;
}

function getAuthorId(item) {
  return item?.authorId ?? null;
}

function getAuthorName(item) {
  return item?.authorName ?? item?.creatorName ?? "Unknown";
}

function getAuthorImage(item) {
  return item?.authorImage ?? null;
}

function getTitle(item) {
  return item?.title ?? item?.name ?? "Untitled";
}

function getImage(item) {
  return item?.nftImage ?? item?.image ?? item?.imageUrl ?? item?.img ?? "";
}

function getPrice(item) {
  const p = item?.price ?? null;
  if (p === null || p === undefined) return null;
  return `${Number(p).toFixed(2)} ETH`;
}

function getLikes(item) {
  return item?.likes ?? 0;
}


function formatRemaining(ms) {
  if (ms <= 0) return "0h 0m 0s";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m}m ${s}s`;
}

function Countdown({ expiryDate }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  
  if (!expiryDate) {
    return <div className="de_countdown">No expiry</div>;
  }

  const targetMs =
    typeof expiryDate === "number" ? expiryDate : Number(expiryDate); // just in case it arrives as a string

  if (!Number.isFinite(targetMs)) {
    return <div className="de_countdown">No expiry</div>;
  }

  const remaining = targetMs - now;
  return <div className="de_countdown">{formatRemaining(remaining)}</div>;
}


function SkeletonSlide() {
  return (
    <div className="keen-slider__slide">
      <div className="nft__item">
        <div className="author_list_pp">
          <div className="ip-skel ip-skel--avatar" />
        </div>

        <div
          className="ip-skel ip-skel--text"
          style={{ width: "45%", margin: "10px 0" }}
        />

        <div className="nft__item_wrap">
          <div className="ip-skel ip-skel--img" />
        </div>

        <div className="nft__item_info">
          <div className="ip-skel ip-skel--title" style={{ height: 20 }} />
          <div
            className="ip-skel ip-skel--text"
            style={{ width: "40%", marginTop: 10 }}
          />
        </div>
      </div>
    </div>
  );
}


export default function NewItems() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [sliderRef, slider] = useKeenSlider(
    {
      loop: true,
      renderMode: "performance",
      slides: { perView: 4, spacing: 16 },
      breakpoints: {
        "(max-width: 1200px)": { slides: { perView: 3, spacing: 16 } },
        "(max-width: 900px)": { slides: { perView: 2, spacing: 12 } },
        "(max-width: 600px)": { slides: { perView: 1, spacing: 12 } },
      },
    },
    [WheelControls],
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      const start = Date.now();
      setIsLoading(true);

      try {
        const { data } = await axios.get(NEW_ITEMS_URL);
        const list = Array.isArray(data) ? data : (data?.newItems ?? []);
        if (mounted) setItems(list);
      } catch (err) {
        console.error("NewItems API error:", err);
        if (mounted) setItems([]);
      } finally {
        const elapsed = Date.now() - start;
        const remaining = 2000 - elapsed;
        if (mounted)
          setTimeout(() => setIsLoading(false), remaining > 0 ? remaining : 0);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    slider.current?.update();
  }, [items.length, isLoading, slider]);

  const slides = useMemo(
    () => (isLoading ? new Array(4).fill(null) : items),
    [isLoading, items],
  );

  return (
    <section id="section-items" className="no-bottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>New Items</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>

          <div className="col-lg-12">
            <div ref={sliderRef} className="keen-slider">
              {slides.map((item, index) => {
                if (!item) return <SkeletonSlide key={`sk-${index}`} />;

                const itemId = getItemId(item, index);
                const authorId = getAuthorId(item);
                const authorName = getAuthorName(item);
                const authorImg = getAuthorImage(item) || AuthorImageFallback;

                const title = getTitle(item);
                const img = getImage(item);
                const price = getPrice(item);
                const likes = getLikes(item);

                return (
                  <div className="keen-slider__slide" key={itemId}>
                    <div className="nft__item">
                      <div className="author_list_pp">
                        <Link
                          to={authorId ? `/author/${authorId}` : "/author"}
                          state={{ authorId, from: "new-items" }}
                          title={`Creator: ${authorName}`}
                        >
                          <img
                            className="lazy"
                            src={authorImg}
                            alt={authorName}
                          />
                          <i className="fa fa-check"></i>
                        </Link>
                      </div>

                      
                      <Countdown expiryDate={item.expiryDate} />

                      <div className="nft__item_wrap">
                        <Link
                          to={
                            itemId ? `/item-details/${itemId}` : "/item-details"
                          }
                          state={{ rawItem: item, from: "new-items" }}
                        >
                          <img
                            src={img}
                            className="lazy nft__item_preview"
                            alt={title}
                            loading="lazy"
                          />
                        </Link>
                      </div>

                      <div className="nft__item_info">
                        <Link
                          to={
                            itemId ? `/item-details/${itemId}` : "/item-details"
                          }
                          state={{ rawItem: item, from: "new-items" }}
                        >
                          <h4>{title}</h4>
                        </Link>

                        <div className="nft__item_price">{price ?? "—"}</div>

                        <div className="nft__item_like">
                          <i className="fa fa-heart"></i>
                          <span>{likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
