import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../../css/styles/skeleton.css";



import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

const wheelControls = (slider) => {
  const wheelHandler = (e) => {
    // Only scroll slider when the mouse is hovering the slider
    if (!slider.container.matches(":hover")) return;

    e.preventDefault();

    const dir =
      Math.abs(e.deltaX) > Math.abs(e.deltaY)
        ? e.deltaX > 0
          ? 1
          : -1
        : e.deltaY > 0
          ? 1
          : -1;

    slider.moveToIdx(slider.track.details.rel + dir);
  };

  slider.on("created", () => {
    slider.container.addEventListener("wheel", wheelHandler, {
      passive: false,
    });
  });

  slider.on("destroyed", () => {
    slider.container.removeEventListener("wheel", wheelHandler);
  });
};

const HotCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sliderRef, slider] = useKeenSlider(
    {
      loop: true,
      mode: "snap",
      renderMode: "performance",
      selector: ".keen-slider__slide",
      slides: { perView: 4, spacing: 24 },
      breakpoints: {
        "(max-width: 1200px)": { slides: { perView: 3, spacing: 16 } },
        "(max-width: 900px)": { slides: { perView: 2, spacing: 14 } },
        "(max-width: 600px)": { slides: { perView: 1, spacing: 12 } },
      },
      created(s) {
        // Prevent Bootstrap/flex weirdness after mount
        s.slides.forEach((el) => (el.style.minWidth = "0"));
      },
      updated(s) {
        // Prevent Bootstrap/flex weirdness after re-render (back/forward nav)
        s.slides.forEach((el) => (el.style.minWidth = "0"));
      },
    },
    [wheelControls],
  );

  // Fetch + force skeleton to show at least 2000ms
  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const fetchCollections = async () => {
      if (!isMounted) return;

      setLoading(true);

      const minMs = 2000;
      const start = Date.now();

      try {
        const { data } = await axios.get(
          "https://us-central1-nft-cloud-functions.cloudfunctions.net/hotCollections",
        );

        if (!isMounted) return;
        setCollections(data);

        const elapsed = Date.now() - start;
        const remaining = Math.max(0, minMs - elapsed);

        timeoutId = setTimeout(() => {
          if (isMounted) setLoading(false);
        }, remaining);
      } catch (e) {
        console.error("Error fetching collections:", e);
        if (isMounted) setLoading(false);
      }
    };

    fetchCollections();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Recalculate Keen whenever the slide list changes
  useEffect(() => {
    // Using rAF helps after route navigation when DOM settles
    const id = requestAnimationFrame(() => {
      slider.current?.update();
    });
    return () => cancelAnimationFrame(id);
  }, [loading, collections, slider]);

  return (
    <section id="section-collections" className="no-bottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>Hot Collections</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>

          <div className="col-lg-12">
            <div ref={sliderRef} className="keen-slider">
              {loading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div className="keen-slider__slide" key={`sk-${index}`}>
                      <div className="nft_coll">
                        <div className="nft_wrap skeleton skeleton-img" />
                        <div className="nft_coll_pp skeleton skeleton-avatar" />
                        <div className="nft_coll_info">
                          <div className="skeleton skeleton-text" />
                          <div className="skeleton skeleton-text small" />
                        </div>
                      </div>
                    </div>
                  ))
                : collections.map((item) => (
                    <div className="keen-slider__slide" key={item.nftId}>
                      <div className="nft_coll">
                        <div className="nft_wrap">
                          <Link to={`/item-details/${item.nftId}`}>
                            <img
                              src={item.nftImage}
                              className="lazy img-fluid"
                              alt={item.title}
                            />
                          </Link>
                        </div>

                        <div className="nft_coll_pp">
                          <Link to={`/author/${item.authorId}`}>
                            <img
                              className="lazy pp-coll"
                              src={item.authorImage}
                              alt=""
                            />
                          </Link>
                          <i className="fa fa-check"></i>
                        </div>

                        <div className="nft_coll_info">
                          <Link to="/explore">
                            <h4>{item.title}</h4>
                          </Link>
                          <span>ERC-{item.code}</span>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotCollections;
