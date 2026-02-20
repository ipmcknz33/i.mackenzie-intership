import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../../css/styles/skeleton.css";

const TOP_SELLERS_API =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/topSellers";

const get = (obj, keys, fallback = "") => {
  for (const k of keys) {
    if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return fallback;
};

const TopSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchSellers = async () => {
      setLoading(true);
      const start = Date.now();

      try {
        const res = await axios.get(TOP_SELLERS_API);
        const data = res?.data;

        const elapsed = Date.now() - start;
        if (elapsed < 800) {
          await new Promise((r) => setTimeout(r, 800 - elapsed));
        }

        if (!mounted) return;

        const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setSellers(arr);
      } catch (err) {
        console.error("Top sellers fetch error:", err);
        if (mounted) setSellers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSellers();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="section-popular" className="pb-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>Top Sellers</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>

          <div className="col-md-12">
            {loading ? (
              <ol className="author_list">
                {new Array(12).fill(0).map((_, index) => (
                  <li key={index}>
                    <div className="author_list_pp">
                      <div className="ip-skel ip-skel--avatar" />
                    </div>
                    <div className="author_list_info">
                      <div className="ip-skel ip-skel--text" style={{ width: 140, marginBottom: 6 }} />
                      <div className="ip-skel ip-skel--text" style={{ width: 80 }} />
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <ol className="author_list">
                {sellers.map((s) => {
                  const authorId = String(get(s, ["authorId", "id", "author_id"], ""));
                  const authorName = get(s, ["authorName", "name", "author_name"], "Unknown");
                  const authorImage = get(s, ["authorImage", "image", "author_image"], "");
                  const price = get(s, ["price", "eth", "amount"], "");

                  return (
                    <li key={authorId || authorName}>
                      <div className="author_list_pp">
                        <Link
                          to={`/author/${authorId}`}
                          state={{
                            author: {
                              authorId,
                              authorName,
                              authorImage,
                              price,
                            },
                          }}
                        >
                          <img className="lazy pp-author" src={authorImage} alt={authorName} />
                          <i className="fa fa-check"></i>
                        </Link>
                      </div>

                      <div className="author_list_info">
                        <Link
                          to={`/author/${authorId}`}
                          state={{
                            author: {
                              authorId,
                              authorName,
                              authorImage,
                              price,
                            },
                          }}
                        >
                          {authorName}
                        </Link>
                        <span>{price ? `${price} ETH` : ""}</span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            {!loading && sellers.length === 0 && (
              <div className="text-center mt-4">
                <p>No top sellers found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopSellers;