import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import EthImage from "../images/ethereum.svg";
import "../css/styles/skeleton.css";

const HOT_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/hotCollections";
const NEW_URL =
  "https://us-central1-nft-cloud-functions.cloudfunctions.net/newItems";

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

const ItemDetails = () => {
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    let mounted = true;

    const fetchItem = async () => {
      setLoading(true);
      const start = Date.now();

      try {
        const nftId = Number(id);

        
        const [hotRes, newRes] = await Promise.allSettled([
          axios.get(HOT_URL),
          axios.get(NEW_URL),
        ]);

        const hotData =
          hotRes.status === "fulfilled" && Array.isArray(hotRes.value.data)
            ? hotRes.value.data
            : [];

        const newData =
          newRes.status === "fulfilled" && Array.isArray(newRes.value.data)
            ? newRes.value.data
            : [];

        const found =
          hotData.find((x) => Number(x.nftId) === nftId) ||
          newData.find((x) => Number(x.nftId) === nftId) ||
          null;

        // force minimum 2s loading so shimmer is visible
        const elapsed = Date.now() - start;
        if (elapsed < 2000) await sleep(2000 - elapsed);

        if (mounted) setItem(found);
      } catch (error) {
        console.error("Error fetching item:", error);

        const elapsed = Date.now() - start;
        if (elapsed < 2000) await sleep(2000 - elapsed);

        if (mounted) setItem(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchItem();

    return () => {
      mounted = false;
    };
  }, [id]);

  
  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row">
          <div className="col-md-6 text-center">
            <div className="ip-skel ip-skel--img" style={{ height: 420 }} />
          </div>

          <div className="col-md-6">
            <div className="ip-skel ip-skel--title" style={{ height: 28 }} />
            <div
              className="ip-skel ip-skel--text"
              style={{ width: "40%", marginTop: 16 }}
            />
            <div
              className="ip-skel ip-skel--text"
              style={{ width: "70%", marginTop: 12 }}
            />

            <div style={{ marginTop: 24 }} className="d-flex flex-row">
              <div className="mr40">
                <div
                  className="ip-skel ip-skel--avatar"
                  style={{ marginBottom: 10 }}
                />
                <div className="ip-skel ip-skel--text" style={{ width: 160 }} />
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <div className="ip-skel ip-skel--text" style={{ width: 120 }} />
              <div
                className="ip-skel ip-skel--text"
                style={{ width: 160, marginTop: 10 }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center mt-5">
        <h3>Item not found</h3>
        <p>That NFT doesn’t exist.</p>
        <Link to="/explore">← Back to Explore</Link>
      </div>
    );
  }

  const title = item.title ?? "Untitled";
  const price =
    item.price !== null && item.price !== undefined
      ? Number(item.price).toFixed(2)
      : null;

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>

        <section aria-label="section" className="mt90 sm-mt-0">
          <div className="container">
            <div className="row">
              <div className="col-md-6 text-center">
                <img
                  src={item.nftImage}
                  className="img-fluid img-rounded mb-sm-30 nft-image"
                  alt={title}
                />
              </div>

              <div className="col-md-6">
                <div className="item_info">
                  <h2>{title}</h2>

                  <div className="item_info_counts">
                    <div className="item_info_views">
                      <i className="fa fa-eye"></i> 100
                    </div>
                    <div className="item_info_like">
                      <i className="fa fa-heart"></i> {item.likes ?? 0}
                    </div>
                  </div>

                  <p>
                    NFT Code: ERC-{item.code ?? "—"} <br />
                    NFT ID: {item.nftId}
                  </p>

                  <div className="d-flex flex-row">
                    <div className="mr40">
                      <h6>Owner</h6>
                      <div className="item_author">
                        <div className="author_list_pp">
                          <Link to={`/author/${item.authorId}`}>
                            <img
                              className="lazy"
                              src={item.authorImage}
                              alt=""
                            />
                            <i className="fa fa-check"></i>
                          </Link>
                        </div>
                        <div className="author_list_info">
                          <Link to={`/author/${item.authorId}`}>
                            Author #{item.authorId}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="de_tab tab_simple">
                    <div className="de_tab_content">
                      <h6>Price</h6>
                      <div className="nft-item-price">
                        <img src={EthImage} alt="" />
                        <span>{price ?? "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ItemDetails;
