var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/dom-to-image-more/dist/dom-to-image-more.min.js
var require_dom_to_image_more_min = __commonJS({
  "node_modules/dom-to-image-more/dist/dom-to-image-more.min.js"(exports, module2) {
    ((d) => {
      let p = /* @__PURE__ */ (() => {
        let e2 = 0;
        return { escape: function(e3) {
          return e3.replace(/([.*+?^${}()|[\]/\\])/g, "\\$1");
        }, isDataUrl: function(e3) {
          return -1 !== e3.search(/^(data:)/);
        }, canvasToBlob: function(t3) {
          if (t3.toBlob)
            return new Promise(function(e3) {
              t3.toBlob(e3);
            });
          return ((o3) => new Promise(function(e3) {
            var t4 = b(o3.toDataURL().split(",")[1]), n3 = t4.length, r3 = new Uint8Array(n3);
            for (let e4 = 0; e4 < n3; e4++)
              r3[e4] = t4.charCodeAt(e4);
            e3(new Blob([r3], { type: "image/png" }));
          }))(t3);
        }, resolveUrl: function(e3, t3) {
          var n3 = document.implementation.createHTMLDocument(), r3 = n3.createElement("base"), o3 = (n3.head.appendChild(r3), n3.createElement("a"));
          return Object.assign(o3.style, h), n3.body.appendChild(o3), r3.href = t3, o3.href = e3, o3.href;
        }, getAndEncode: function(e3, t3) {
          return c2(e3, t3, true).then(s2);
        }, getResourceText: function(e3, t3, n3) {
          return c2(e3, t3, n3).then(u2);
        }, uid: function() {
          return "u" + ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4) + e2++;
        }, asArray: function(e3) {
          return Array.from(e3);
        }, escapeXhtml: function(e3) {
          return e3.replace(/%/g, "%25").replace(/#/g, "%23").replace(/\n/g, "%0A");
        }, makeImage: function(i3) {
          return "data:," !== i3 ? new Promise(function(t3, n3) {
            let r3 = document.createElementNS("http://www.w3.org/2000/svg", "svg"), o3 = new Image();
            v.impl.options.useCredentials && (o3.crossOrigin = "use-credentials"), o3.onload = function() {
              function e3() {
                window && window.requestAnimationFrame ? window.requestAnimationFrame(function() {
                  t3(o3);
                }) : t3(o3);
              }
              r3.remove(), "function" == typeof o3.decode ? o3.decode().then(e3, e3) : e3();
            }, o3.onerror = (e3) => {
              r3.remove();
              var t4 = String(i3).split(",", 1)[0], t4 = new Error("dom-to-image-more: failed to rasterize the generated image (" + t4 + ", " + String(i3).length + " bytes). The source may contain malformed markup, an unsupported element, or a tainted/cross-origin resource.");
              t4.cause = e3, n3(t4);
            }, r3.appendChild(o3), Object.assign(r3.style, h), o3.src = i3, document.body.appendChild(r3);
          }) : Promise.resolve();
        }, width: function(e3) {
          var t3 = m2(e3, "width");
          if (!isNaN(t3))
            return t3;
          t3 = f2(e3);
          if (t3)
            return t3.width;
          var t3 = m2(e3, "border-left-width"), n3 = m2(e3, "border-right-width");
          return e3.scrollWidth + t3 + n3;
        }, height: function(e3) {
          var t3 = m2(e3, "height");
          if (!isNaN(t3))
            return t3;
          t3 = f2(e3);
          if (t3)
            return t3.height;
          var t3 = m2(e3, "border-top-width"), n3 = m2(e3, "border-bottom-width");
          return e3.scrollHeight + t3 + n3;
        }, getWindow: r2, isElement: l2, isElementHostForOpenShadowRoot: function(e3) {
          return l2(e3) && null !== e3.shadowRoot;
        }, isShadowRoot: n2, isInShadowRoot: i2, isHTMLElement: function(e3) {
          return t2(e3, "HTMLElement");
        }, isHTMLCanvasElement: function(e3) {
          return t2(e3, "HTMLCanvasElement");
        }, isHTMLInputElement: function(e3) {
          return t2(e3, "HTMLInputElement");
        }, isHTMLImageElement: function(e3) {
          return t2(e3, "HTMLImageElement");
        }, isHTMLLinkElement: function(e3) {
          return t2(e3, "HTMLLinkElement");
        }, isHTMLScriptElement: function(e3) {
          return t2(e3, "HTMLScriptElement");
        }, isHTMLStyleElement: function(e3) {
          return t2(e3, "HTMLStyleElement");
        }, isHTMLTextAreaElement: function(e3) {
          return t2(e3, "HTMLTextAreaElement");
        }, isShadowSlotElement: function(e3) {
          return i2(e3) && t2(e3, "HTMLSlotElement");
        }, isSVGElement: function(e3) {
          return t2(e3, "SVGElement");
        }, isSVGImageElement: function(e3) {
          return t2(e3, "SVGImageElement");
        }, isSVGSVGElement: function(e3) {
          return t2(e3, "SVGSVGElement");
        }, isSVGRectElement: function(e3) {
          return t2(e3, "SVGRectElement");
        }, isSVGUseElement: function(e3) {
          return t2(e3, "SVGUseElement");
        }, isDimensionMissing: function(e3) {
          return isNaN(e3) || e3 <= 0;
        }, isInstanceOf: t2 };
        function r2(e3) {
          e3 = e3 ? e3.ownerDocument : void 0;
          return (e3 ? e3.defaultView : void 0) || ("undefined" != typeof window ? window : void 0) || (void 0 !== d ? d : void 0) || globalThis;
        }
        function t2(e3, t3) {
          var n3 = r2(e3);
          return o2(e3, n3, t3) || o2(e3, n3 && n3.parent, t3);
        }
        function o2(e3, t3, n3) {
          try {
            var r3 = t3 && t3[n3];
            return "function" == typeof r3 && e3 instanceof r3;
          } catch (e4) {
            return false;
          }
        }
        function n2(e3) {
          return t2(e3, "ShadowRoot");
        }
        function i2(e3) {
          return null != e3 && void 0 !== e3.getRootNode && n2(e3.getRootNode());
        }
        function l2(e3) {
          return t2(e3, "Element");
        }
        function s2(e3) {
          return null == e3 || "" === e3 ? "" : "string" == typeof e3 ? e3 : a2(e3, "readAsDataURL", "");
        }
        function u2(e3) {
          if (null == e3 || "" === e3)
            return null;
          if ("string" != typeof e3)
            return a2(e3, "readAsText", null);
          {
            var r3 = (e3 = e3).indexOf(",");
            if (-1 === r3)
              return "";
            var o3 = e3.slice(0, r3), e3 = e3.slice(r3 + 1);
            if (!/;base64/i.test(o3))
              return decodeURIComponent(e3);
            let t3 = b(e3), n3 = "";
            for (let e4 = 0; e4 < t3.length; e4 += 1)
              n3 += "%" + ("00" + t3.charCodeAt(e4).toString(16)).slice(-2);
            return decodeURIComponent(n3);
          }
        }
        function a2(n3, r3, o3) {
          return new Promise(function(t3) {
            let e3 = new FileReader();
            e3.onloadend = function() {
              t3(e3.result);
            }, e3.onerror = function() {
              t3(o3);
            };
            try {
              e3[r3](n3);
            } catch (e4) {
              t3(o3);
            }
          });
        }
        function c2(a3, c3, e3) {
          let t3 = v.impl.urlCache.find(function(e4) {
            return e4.url === a3;
          });
          if (t3 || (t3 = { url: a3, promise: null }, v.impl.urlCache.push(t3)), null === t3.promise) {
            let s3 = function(e4) {
              var t4 = v.impl.options.requestInterceptor;
              if ("function" == typeof t4)
                try {
                  return t4(a3, { type: c3, status: e4 });
                } catch (e5) {
                  S("requestInterceptor threw:", e5);
                }
            }, u3 = function(e4) {
              return null != e4;
            };
            var n3 = s3(void 0);
            if (u3(n3))
              return t3.promise = Promise.resolve(n3), t3.promise;
            if (false === e3)
              return t3.promise = Promise.resolve(null), t3.promise;
            v.impl.options.cacheBust && (a3 += (/\?/.test(a3) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime()), t3.promise = new Promise(function(n4) {
              let o3 = new XMLHttpRequest();
              function i3(e5) {
                l3(e5, false), n4(null);
              }
              function t4() {
                r3("Status:" + o3.status + " while fetching resource: " + a3);
              }
              function r3(t5) {
                var e5 = s3(o3.status);
                u3(e5) ? Promise.resolve(e5).then(function(e6) {
                  l3(t5, true), n4(e6);
                }, function() {
                  S(t5), i3(t5);
                }) : (e5 = c3 === y.IMAGE || c3 === y.CSS_IMAGE ? v.impl.options.imagePlaceholder : void 0) ? (l3(t5, true), n4(e5)) : (S(t5), i3(t5));
              }
              function l3(e5, t5) {
                var n5 = v.impl.options.onImageError;
                if ("function" == typeof n5)
                  try {
                    n5({ url: a3, message: e5, status: o3.status, willUsePlaceholder: t5 });
                  } catch (e6) {
                    S("onImageError handler threw:", e6);
                  }
              }
              if (o3.timeout = v.impl.options.httpTimeout, o3.onerror = t4, o3.ontimeout = t4, o3.onloadend = function() {
                var e5;
                o3.readyState === XMLHttpRequest.DONE && (0 === (e5 = o3.status) && a3.toLowerCase().startsWith("file://") || 200 <= e5 && e5 <= 300 && null !== o3.response ? (e5 = o3.response) instanceof Blob ? n4(e5) : r3("Response was not a Blob (got " + typeof e5 + ") while fetching resource: " + a3) : t4());
              }, 0 < v.impl.options.useCredentialsFilters.length && (v.impl.options.useCredentials = 0 < v.impl.options.useCredentialsFilters.filter((e5) => 0 <= a3.search(e5)).length), v.impl.options.useCredentials && (o3.withCredentials = true), v.impl.options.corsImg && 0 === a3.indexOf("http") && -1 === a3.indexOf(window.location.origin)) {
                var e4 = "POST" === (v.impl.options.corsImg.method || "GET").toUpperCase() ? "POST" : "GET";
                o3.open(e4, (v.impl.options.corsImg.url || "").replace("#{cors}", a3), true);
                let t5 = false, n5 = v.impl.options.corsImg.headers || {}, r4 = (Object.keys(n5).forEach(function(e5) {
                  -1 !== n5[e5].indexOf("application/json") && (t5 = true), o3.setRequestHeader(e5, n5[e5]);
                }), ((e5) => {
                  try {
                    return JSON.parse(JSON.stringify(e5));
                  } catch (e6) {
                    S("corsImg.data is missing or invalid", e6), i3("corsImg.data is missing or invalid");
                  }
                })(v.impl.options.corsImg.data || ""));
                Object.keys(r4).forEach(function(e5) {
                  "string" == typeof r4[e5] && (r4[e5] = r4[e5].replace("#{cors}", a3));
                }), o3.responseType = "blob", o3.send(t5 ? JSON.stringify(r4) : r4);
              } else
                o3.open("GET", a3, true), o3.responseType = "blob", o3.send();
            });
          }
          return t3.promise;
        }
        function f2(e3) {
          if (e3.nodeType !== w || "function" != typeof e3.getBBox)
            return null;
          try {
            var t3 = e3.getBBox();
            return t3 && (t3.width || t3.height) ? t3 : null;
          } catch (e4) {
            return null;
          }
        }
        function m2(t3, n3) {
          if (t3.nodeType === w) {
            let e3 = E(t3).getPropertyValue(n3);
            if ("px" === e3.slice(-2))
              return e3 = e3.slice(0, -2), parseFloat(e3);
          }
          return NaN;
        }
      })(), g = /* @__PURE__ */ (() => {
        let r2 = /url\(\s*(["']?)((?:\\.|[^\\)])+)\1\s*\)/gm;
        return { inlineAll: function(t2, r3, o2, i2) {
          if (!e2(t2))
            return Promise.resolve(t2);
          return Promise.resolve(t2).then(n2).then(function(e3) {
            return v.impl.options.filterUrls ? e3.filter(function(e4) {
              return v.impl.options.filterUrls(e4, r3);
            }) : e3;
          }).then(function(e3) {
            let n3 = Promise.resolve(t2);
            return e3.forEach(function(t3) {
              n3 = n3.then(function(e4) {
                return s2(e4, t3, r3, o2, i2);
              });
            }), n3;
          });
        }, shouldProcess: e2, impl: { readUrls: n2, inline: s2, urlAsRegex: l2 } };
        function e2(e3) {
          return -1 !== e3.search(r2);
        }
        function n2(e3) {
          for (var t2, n3 = []; null !== (t2 = r2.exec(e3)); )
            n3.push(t2[2]);
          return n3.filter(function(e4) {
            return !p.isDataUrl(e4);
          });
        }
        function l2(e3) {
          return new RegExp(`url\\((["']?)(${p.escape(e3)})\\1\\)`, "gm");
        }
        function s2(n3, r3, t2, o2, i2) {
          return Promise.resolve(r3).then(function(e3) {
            return t2 ? p.resolveUrl(e3, t2) : e3;
          }).then(function(e3) {
            return (i2 || p.getAndEncode)(e3, o2);
          }).then(function(e3) {
            var t3 = l2(r3);
            return n3.replace(t3, `url($1${e3}$1)`);
          });
        }
      })(), e = { resolveAll: function() {
        return t().then(function(e2) {
          return Promise.all(e2.map(function(e3) {
            return e3.resolve();
          }));
        }).then(function(e2) {
          return e2.join("\n");
        });
      }, impl: { readAll: t } };
      function t() {
        return Promise.resolve(p.asArray(document.styleSheets)).then(function(e2) {
          let r2 = "function" == typeof v.impl.options.requestInterceptor, o2 = {};
          return Promise.all(e2.map(function(t3) {
            let n2 = t3.href;
            if (!n2 || o2[n2])
              return t3;
            o2[n2] = true;
            var e3 = ((e4) => {
              try {
                return !e4.cssRules;
              } catch (e5) {
                return true;
              }
            })(t3) && ((e4) => {
              var t4 = v.impl.options.loadExternalStyleSheet;
              if ("function" == typeof t4)
                try {
                  return true === t4(e4);
                } catch (e5) {
                  return S("domtoimage: loadExternalStyleSheet predicate threw:", e5), false;
                }
              return true === t4;
            })(n2);
            return r2 || e3 ? p.getResourceText(n2, y.STYLESHEET, e3).then(function(e4) {
              return e4 && ((e5, t4) => {
                try {
                  var n3 = document.implementation.createHTMLDocument(""), r3 = n3.createElement("style");
                  return r3.appendChild(document.createTextNode(((e6, r4) => e6.replace(/url\((['"]?)([^'")]+)\1\)/g, function(e7, t5, n4) {
                    n4 = n4.trim();
                    return p.isDataUrl(n4) || /^[a-z][a-z0-9+.-]*:/i.test(n4) ? e7 : `url(${t5}${p.resolveUrl(n4, r4)}${t5})`;
                  }))(e5, t4))), n3.body.appendChild(r3), r3.sheet;
                } catch (e6) {
                  return null;
                }
              })(e4, n2) || t3;
            }) : t3;
          }));
        }).then(function(e2) {
          let n2 = [];
          return e2.forEach(function(t3) {
            var e3 = Object.getPrototypeOf(t3);
            if (Object.prototype.hasOwnProperty.call(e3, "cssRules"))
              try {
                p.asArray(t3.cssRules || []).forEach(n2.push.bind(n2));
              } catch (e4) {
                v.impl.options.ignoreCSSRuleErrors || S("domtoimage: Error while reading CSS rules from: " + t3.href, e4);
              }
          }), n2;
        }).then(function(e2) {
          return e2.filter(function(e3) {
            return e3.type === CSSRule.FONT_FACE_RULE;
          }).filter(function(e3) {
            return g.shouldProcess(e3.style.getPropertyValue("src"));
          });
        }).then(function(e2) {
          return e2.map(t2);
        });
        function t2(t3) {
          return { resolve: function() {
            var e2 = (t3.parentStyleSheet || {}).href;
            return g.inlineAll(t3.cssText, e2, y.FONT);
          }, src: function() {
            return t3.style.getPropertyValue("src");
          } };
        }
      }
      let n = { inlineAll: function t2(e2) {
        if (!p.isElement(e2))
          return Promise.resolve(e2);
        return n2(e2).then(function() {
          return p.isHTMLImageElement(e2) ? r(e2).inline() : p.isSVGImageElement(e2) ? o(e2) : Promise.all(p.asArray(e2.childNodes).map(function(e3) {
            return t2(e3);
          }));
        });
        function n2(r2) {
          if (!r2.style)
            return Promise.resolve(r2);
          let e3 = ["background", "background-image", "mask", "mask-image", "-webkit-mask", "-webkit-mask-image"], t3 = e3.map(function(t4) {
            let e4 = r2.style.getPropertyValue(t4), n3 = r2.style.getPropertyPriority(t4);
            return e4 ? g.inlineAll(e4, void 0, y.CSS_IMAGE).then(function(e5) {
              r2.style.setProperty(t4, e5, n3);
            }) : Promise.resolve();
          });
          return Promise.all(t3).then(function() {
            return r2;
          });
        }
      }, impl: { newImage: r } };
      function r(n2) {
        return { inline: function(t2) {
          if (p.isDataUrl(n2.src))
            return Promise.resolve();
          return Promise.resolve(n2.src).then(function(e2) {
            return (t2 || p.getAndEncode)(e2, y.IMAGE);
          }).then(function(t3) {
            return new Promise(function(e2) {
              n2.onload = e2, n2.onerror = e2, n2.src = t3;
            });
          });
        } };
      }
      function o(t2, n2) {
        let r2 = "http://www.w3.org/1999/xlink";
        var e2 = t2.getAttribute("href") || t2.getAttributeNS(r2, "href") || t2.getAttribute("xlink:href");
        return !e2 || p.isDataUrl(e2) ? Promise.resolve(t2) : Promise.resolve(e2).then(function(e3) {
          return (n2 || p.getAndEncode)(e3, y.IMAGE);
        }).then(function(e3) {
          return e3 && (t2.setAttributeNS(r2, "xlink:href", e3), t2.setAttribute("href", e3)), t2;
        });
      }
      let h = { position: "fixed", left: "-9999px", visibility: "hidden" }, i = { warn: function(...e2) {
        console.warn(...e2);
      }, error: function(...e2) {
        console.error(...e2);
      } }, l = { copyDefaultStyles: true, imagePlaceholder: void 0, cacheBust: false, useCredentials: false, useCredentialsFilters: [], httpTimeout: 3e4, styleCaching: "strict", corsImg: void 0, adjustClonedNode: void 0, filterStyles: void 0, filterUrls: void 0, adjustPseudoElement: void 0, onImageError: void 0, ensureShown: false, pixelRatio: 1, preserveScroll: false, ignoreCSSRuleErrors: false, requestInterceptor: void 0, loadExternalStyleSheet: false, logger: i }, y = Object.freeze({ IMAGE: "image", CSS_IMAGE: "css-image", FONT: "font", STYLESHEET: "stylesheet" }), v = { toSvg: a, toPng: function(e2, t2) {
        return c(e2, t2).then(function(e3) {
          return e3.toDataURL();
        });
      }, toJpeg: function(e2, t2) {
        return c(e2, t2).then(function(e3) {
          return e3.toDataURL("image/jpeg", (t2 ? t2.quality : void 0) || 1);
        });
      }, toBlob: function(e2, t2) {
        return c(e2, t2).then(p.canvasToBlob);
      }, toPixelData: function(t2, e2) {
        return c(t2, e2).then(function(e3) {
          return e3.getContext("2d").getImageData(0, 0, p.width(t2), p.height(t2)).data;
        });
      }, toCanvas: c, ResourceType: y, impl: { fontFaces: e, images: n, util: p, inliner: g, urlCache: [], options: {}, copyOptions: function(t2) {
        Object.keys(l).forEach(function(e2) {
          v.impl.options[e2] = (void 0 === t2[e2] ? l : t2)[e2];
        });
      }, resetUrlCache: f } };
      function f() {
        v.impl.urlCache = [];
      }
      "object" == typeof exports && "object" == typeof module2 ? module2.exports = v : d.domtoimage = v;
      let w = ("undefined" != typeof Node ? Node.ELEMENT_NODE : void 0) || 1, E = s("getComputedStyle"), b = s("atob");
      function s(e2) {
        return (void 0 !== d ? d[e2] : void 0) || ("undefined" != typeof window ? window[e2] : void 0) || globalThis[e2];
      }
      function m(...e2) {
        u("warn", e2);
      }
      function S(...e2) {
        u("error", e2);
      }
      function u(e2, t2) {
        var n2 = v.impl.options.logger || i, e2 = n2[e2];
        "function" == typeof e2 && e2.apply(n2, t2);
      }
      function a(s2, u2) {
        let i2 = v.impl.util.getWindow(s2), o2 = (u2 = u2 || {}, v.impl.copyOptions(u2), []);
        return T = [], i2 && i2.document ? (() => {
          var e2 = i2.document;
          if (!e2.fonts || !e2.fonts.ready)
            return Promise.resolve();
          let t2 = v.impl.options.httpTimeout || 3e4, n2, r2 = Promise.resolve(e2.fonts.ready).then(function() {
            return false;
          }, function() {
            return false;
          }), o3 = new Promise(function(e3) {
            n2 = i2.setTimeout(function() {
              e3(true);
            }, t2);
          });
          return Promise.race([r2, o3]).then(function(e3) {
            i2.clearTimeout(n2), e3 && m("dom-to-image-more: timed out after " + t2 + "ms waiting for document fonts to finish loading (document.fonts.ready); rendering anyway \u2014 the output may have missing glyphs or fallback-font metrics.");
          });
        })().then(function() {
          var e2 = s2;
          if (e2.nodeType === w)
            return e2;
          var t2, n2 = e2, r2 = e2.parentNode;
          if (r2)
            return t2 = document.createElement("span"), r2.replaceChild(t2, n2), t2.append(e2), o2.push({ parent: r2, child: n2, wrapper: t2 }), t2;
          throw new Error("Cannot render a non-element node that is not attached to a parent; wrap it in an element or attach it to the document first.");
        }).then(function(e2) {
          return function l2(t2, d2, h2, s3) {
            let e3 = d2.filter;
            if (t2 === P || p.isHTMLScriptElement(t2) || p.isHTMLStyleElement(t2) || p.isHTMLLinkElement(t2) || null !== h2 && e3 && !e3(t2))
              return Promise.resolve();
            return Promise.resolve(t2).then(n2).then(r2).then(function(e4) {
              return u3(e4, i3(t2));
            }).then(o3).then(function(e4) {
              return a3(e4, t2);
            });
            function n2(e4) {
              return p.isHTMLCanvasElement(e4) ? p.makeImage(e4.toDataURL()) : e4.cloneNode(false);
            }
            function r2(e4) {
              return d2.adjustClonedNode && d2.adjustClonedNode(t2, e4, false), Promise.resolve(e4);
            }
            function o3(e4) {
              return d2.adjustClonedNode && d2.adjustClonedNode(t2, e4, true), Promise.resolve(e4);
            }
            function i3(e4) {
              return p.isElementHostForOpenShadowRoot(e4) ? e4.shadowRoot : e4;
            }
            function u3(n3, e4) {
              let r3 = t3(e4), o4 = Promise.resolve();
              if (0 !== r3.length) {
                let t4 = E(i4(e4));
                p.asArray(r3).forEach(function(e5) {
                  o4 = o4.then(function() {
                    return l2(e5, d2, t4, s3).then(function(e6) {
                      e6 && n3.appendChild(e6);
                    });
                  });
                });
              }
              return o4.then(function() {
                return n3;
              });
              function i4(e5) {
                return p.isShadowRoot(e5) ? e5.host : e5;
              }
              function t3(t4) {
                if (p.isShadowSlotElement(t4)) {
                  let e5 = t4.assignedNodes();
                  if (e5 && 0 < e5.length)
                    return e5;
                }
                return t4.childNodes;
              }
            }
            function a3(a4, c3) {
              return !p.isElement(a4) || p.isShadowSlotElement(c3) ? Promise.resolve(a4) : Promise.resolve().then(n3).then(o4).then(i4).then(l3).then(t3).then(e4).then(s4).then(u4).then(r3).then(function() {
                return a4;
              });
              function e4() {
                if (d2.preserveScroll && a4.style) {
                  let e5 = c3.scrollLeft || 0, t4 = c3.scrollTop || 0;
                  if (0 !== e5 || 0 !== t4) {
                    a4.style.overflow = "hidden";
                    let n4 = `translate(${-e5}px, ${-t4}px)`;
                    p.asArray(a4.children).forEach(function(t5) {
                      if (t5.style) {
                        let e6 = t5.style.transform && "none" !== t5.style.transform ? " " + t5.style.transform : "";
                        t5.style.transform = n4 + e6;
                      }
                    });
                  }
                }
              }
              function t3() {
                if (a4.attributes && a4.removeAttribute) {
                  let n4 = [];
                  for (let t4 = 0; t4 < a4.attributes.length; t4 += 1) {
                    let e5 = a4.attributes[t4].name;
                    /["'=<>/\s]/.test(e5) && n4.push(e5);
                  }
                  n4.forEach(function(e5) {
                    a4.removeAttribute(e5);
                  });
                }
              }
              function n3() {
                if (p.isHTMLImageElement(c3) && "function" == typeof c3.decode && !(c3.complete && 0 < c3.naturalWidth))
                  return c3.decode().catch(function() {
                  });
              }
              function r3() {
                p.isHTMLImageElement(a4) && (a4.removeAttribute("loading"), c3.srcset || c3.sizes) && (a4.removeAttribute("srcset"), a4.removeAttribute("sizes"), a4.src = c3.currentSrc || c3.src);
              }
              function o4() {
                function e5() {
                  let t5 = E(c3).getPropertyValue("visibility");
                  if (null === h2)
                    "visible" !== t5 && a4.style.setProperty("visibility", "visible");
                  else {
                    let e6 = h2.getPropertyValue("visibility");
                    t5 === e6 && a4.style.removeProperty("visibility");
                  }
                }
                function r4(e6, t5) {
                  t5.font = e6.font, t5.fontFamily = e6.fontFamily, t5.fontFeatureSettings = e6.fontFeatureSettings, t5.fontKerning = e6.fontKerning, t5.fontSize = e6.fontSize, t5.fontStretch = e6.fontStretch, t5.fontStyle = e6.fontStyle, t5.fontVariant = e6.fontVariant, t5.fontVariantCaps = e6.fontVariantCaps, t5.fontVariantEastAsian = e6.fontVariantEastAsian, t5.fontVariantLigatures = e6.fontVariantLigatures, t5.fontVariantNumeric = e6.fontVariantNumeric, t5.fontVariationSettings = e6.fontVariationSettings, t5.fontWeight = e6.fontWeight;
                }
                function t4(e6, t5) {
                  let n4 = E(e6);
                  n4.cssText ? (t5.style.cssText = n4.cssText, r4(n4, t5.style)) : (I(d2, e6, n4, h2, t5), null === h2 && (["inset-block", "inset-block-start", "inset-block-end"].forEach((e7) => t5.style.removeProperty(e7)), ["left", "right", "top", "bottom"].forEach((e7) => {
                    t5.style.getPropertyValue(e7) && t5.style.setProperty(e7, "0px");
                  })));
                }
                a4.style && (t4(c3, a4), e5());
              }
              function i4() {
                let u5 = p.uid();
                return Promise.all([":before", ":after"].map(e5));
                function e5(o5) {
                  let i5 = E(c3, o5), l4 = i5.getPropertyValue("content");
                  if ("" !== l4 && "none" !== l4) {
                    let s6 = function() {
                      let e7 = p.asArray(i5).map(t5).join("; ");
                      return e7 + ";";
                      function t5(e8) {
                        let t6 = i5.getPropertyValue(e8), n5 = i5.getPropertyPriority(e8) ? " !important" : "";
                        return e8 + ": " + t6 + n5;
                      }
                    };
                    var s5 = s6;
                    let t4;
                    if (d2.adjustPseudoElement) {
                      let e7 = d2.adjustPseudoElement(c3, o5, i5);
                      if (false === e7)
                        return;
                      e7 && "object" == typeof e7 && (t4 = e7);
                    }
                    let e6 = a4.getAttribute("class") || "", n4 = (a4.setAttribute("class", e6 + " " + u5), `.${u5}:` + o5), r4 = i5.cssText ? `${i5.cssText} content: ${l4};` : s6();
                    return t4 && (r4 += Object.keys(t4).map(function(e7) {
                      return ` ${e7}: ${t4[e7]};`;
                    }).join("")), g.inlineAll(r4, void 0, y.CSS_IMAGE).then(function(e7) {
                      let t5 = document.createElement("style");
                      t5.appendChild(document.createTextNode(n4 + `{${e7}}`)), a4.appendChild(t5);
                    });
                  }
                }
              }
              function l3() {
                p.isHTMLTextAreaElement(c3) && (a4.innerHTML = c3.value), p.isHTMLInputElement(c3) && a4.setAttribute("value", c3.value);
              }
              function s4() {
                p.isSVGElement(a4) && (a4.setAttribute("xmlns", "http://www.w3.org/2000/svg"), p.isSVGRectElement(a4) && ["width", "height"].forEach(function(e5) {
                  let t4 = a4.getAttribute(e5);
                  t4 && a4.style.setProperty(e5, t4);
                }), p.isSVGUseElement(a4)) && m2(c3);
              }
              function u4() {
                if (p.isElement(a4) && f2()) {
                  let e5 = E(c3).getPropertyValue("display");
                  "table" !== e5 && "inline-table" !== e5 || (a4.style.removeProperty("height"), a4.style.removeProperty("block-size"));
                }
              }
              function f2() {
                let t4 = c3.children || [];
                for (let e5 = 0; e5 < t4.length; e5 += 1)
                  if ("CAPTION" === t4[e5].tagName)
                    return true;
                return false;
              }
              function m2(e5) {
                let t4 = e5.getAttribute("href") || e5.getAttributeNS("http://www.w3.org/1999/xlink", "href") || e5.getAttribute("xlink:href");
                if (t4 && "#" === t4.charAt(0)) {
                  let n4 = t4.slice(1);
                  if (!T.some((e6) => e6.id === n4)) {
                    let t5 = e5.ownerDocument.getElementById(n4);
                    if (t5) {
                      let e6 = t5.cloneNode(true);
                      e6.setAttribute("xmlns", "http://www.w3.org/2000/svg"), T.push({ id: n4, node: e6 });
                    }
                  }
                }
              }
            }
          }(e2, u2, null, i2);
        }).then(function(e2) {
          if (0 !== T.length) {
            var o3 = "http://www.w3.org/2000/svg", i3 = document.createElementNS(o3, "svg");
            i3.setAttribute("xmlns", o3), i3.setAttribute("width", "0"), i3.setAttribute("height", "0"), i3.style.setProperty("position", "absolute"), i3.style.setProperty("width", "0"), i3.style.setProperty("height", "0"), i3.style.setProperty("overflow", "hidden");
            let t2 = document.createElementNS(o3, "defs"), n2 = (i3.appendChild(t2), /* @__PURE__ */ new Set()), r2 = (e2.getAttribute("id") && n2.add(e2.getAttribute("id")), e2.querySelectorAll("[id]").forEach(function(e3) {
              n2.add(e3.getAttribute("id"));
            }), 0);
            T.forEach(function(e3) {
              n2.has(e3.id) || (t2.appendChild(e3.node), r2 += 1);
            }), 0 < r2 && e2.insertBefore(i3, e2.firstChild);
          }
          return e2;
        }).then(u2.disableEmbedFonts ? Promise.resolve(s2) : A).then(u2.disableInlineImages ? Promise.resolve(s2) : C).then(function(e2) {
          e2.style && (e2.style.margin = "0");
          u2.bgcolor && (e2.style.backgroundColor = u2.bgcolor);
          u2.width && (e2.style.width = u2.width + "px");
          u2.height && (e2.style.height = u2.height + "px");
          u2.style && Object.assign(e2.style, u2.style);
          let t2 = null;
          "function" == typeof u2.onclone && (t2 = u2.onclone(e2));
          return Promise.resolve(t2).then(function() {
            return e2;
          });
        }).then(function(e2) {
          if (p.isSVGElement(s2) && !p.isSVGSVGElement(s2))
            return ((e3) => {
              let r3 = "http://www.w3.org/2000/svg", t3 = c2(e3), o3;
              try {
                o3 = s2.getBBox();
              } catch (e4) {
                o3 = { x: 0, y: 0, width: 0, height: 0 };
              } finally {
                t3();
              }
              e3.removeAttribute("transform"), e3.style.removeProperty("transform");
              let i3 = u2.width || o3.width, l2 = u2.height || o3.height;
              return Promise.resolve(e3).then(function(e4) {
                return e4.setAttribute("xmlns", r3), new XMLSerializer().serializeToString(e4);
              }).then(a2).then(p.escapeXhtml).then(function(e4) {
                var t4 = (p.isDimensionMissing(i3) ? "" : ` width="${i3}"`) + (p.isDimensionMissing(l2) ? "" : ` height="${l2}"`), n3 = `${o3.x} ${o3.y} ${o3.width} ` + o3.height;
                return `<svg xmlns="${r3}"${t4} viewBox="${n3}">${e4}</svg>`;
              }).then(function(e4) {
                return "data:image/svg+xml;charset=utf-8," + e4;
              });
            })(e2);
          let t2 = c2(e2), n2, r2;
          try {
            n2 = u2.width || p.width(s2), r2 = u2.height || p.height(s2);
          } finally {
            t2();
          }
          return Promise.resolve(e2).then(function(e3) {
            return e3.setAttribute("xmlns", "http://www.w3.org/1999/xhtml"), new XMLSerializer().serializeToString(e3);
          }).then(a2).then(p.escapeXhtml).then(function(e3) {
            var t3 = (p.isDimensionMissing(n2) ? ' width="100%"' : ` width="${n2}"`) + (p.isDimensionMissing(r2) ? ' height="100%"' : ` height="${r2}"`);
            return `<svg xmlns="http://www.w3.org/2000/svg"${(p.isDimensionMissing(n2) ? "" : ` width="${n2}"`) + (p.isDimensionMissing(r2) ? "" : ` height="${r2}"`)}><foreignObject${t3}>${e3}</foreignObject></svg>`;
          }).then(function(e3) {
            return "data:image/svg+xml;charset=utf-8," + e3;
          });
        }).finally(function() {
          (() => {
            for (; 0 < o2.length; ) {
              var e2 = o2.pop();
              try {
                e2.parent.replaceChild(e2.child, e2.wrapper);
              } catch (e3) {
                S("domtoimage: failed to restore wrapped node", e3);
              }
            }
          })(), f(), T = [], (() => {
            P && (P.remove(), P = null), L && clearTimeout(L), L = setTimeout(() => {
              L = null, V = {};
            }, 2e4);
          })();
        }) : Promise.reject(new Error("dom-to-image-more: a browser DOM is required (SSR)"));
        function a2(e2) {
          return e2.replace(/url\(&quot;([^]*?)&quot;\)/g, function(e3, t2) {
            return 0 <= t2.indexOf("'") ? e3 : `url('${t2}')`;
          });
        }
        function c2(t2) {
          function e2() {
          }
          if (!u2.ensureShown)
            return e2;
          var n2 = E(s2);
          if ("0" === n2.getPropertyValue("opacity") && t2.style.setProperty("opacity", "1"), "none" !== n2.getPropertyValue("display"))
            return e2;
          let r2 = s2.style.getPropertyValue("display"), o3 = s2.style.getPropertyPriority("display");
          return s2.style.removeProperty("display"), "none" === E(s2).getPropertyValue("display") && (n2 = r2 && "none" !== r2 ? r2 : "revert", s2.style.setProperty("display", n2, "important")), function() {
            var e3 = E(s2).getPropertyValue("display");
            t2.style.setProperty("display", "none" === e3 ? "block" : e3), r2 ? s2.style.setProperty("display", r2, o3) : s2.style.removeProperty("display");
          };
        }
      }
      function c(i2, l2) {
        return a(i2, l2 = l2 || {}).then(p.makeImage).then(function(e2) {
          var t2 = ((e3) => {
            let t3 = l2.width || p.width(e3), n3 = l2.height || p.height(e3);
            p.isDimensionMissing(t3) && (t3 = p.isDimensionMissing(n3) ? 300 : 2 * n3), p.isDimensionMissing(n3) && (n3 = t3 / 2);
            var r3, e3 = ("number" == typeof l2.scale ? l2.scale : 1) * ("number" == typeof l2.pixelRatio ? l2.pixelRatio : 1), e3 = ((e4, t4, n4) => {
              var r4 = 16384, o4 = 0 < e4 && 0 < t4 && 0 < n4;
              return !o4 || (o4 = Math.min(r4 / e4, r4 / t4, Math.sqrt(268435456 / (e4 * t4))), n4 <= o4) ? n4 : (m("dom-to-image-more: the requested " + Math.round(e4 * n4) + "\xD7" + Math.round(t4 * n4) + " canvas exceeds the browser limit; clamping the effective scale from " + n4 + " to " + o4 + ". Capture detail may be reduced \u2014 render a smaller region or lower scale/pixelRatio."), o4);
            })(t3, n3, e3), o3 = document.createElement("canvas");
            return o3.width = t3 * e3, o3.height = n3 * e3, l2.bgcolor && ((r3 = o3.getContext("2d")).fillStyle = l2.bgcolor, r3.fillRect(0, 0, o3.width, o3.height)), { canvas: o3, scale: e3, width: t3, height: n3 };
          })(i2), n2 = t2.canvas, r2 = t2.scale, o2 = n2.getContext("2d");
          return o2.msImageSmoothingEnabled = false, o2.imageSmoothingEnabled = false, e2 && (o2.scale(r2, r2), o2.drawImage(e2, 0, 0, t2.width, t2.height)), n2;
        });
      }
      let P = null, T = [];
      function A(n2) {
        return e.resolveAll().then(function(e2) {
          var t2;
          return "" !== e2 && (t2 = document.createElement("style"), n2.appendChild(t2), t2.appendChild(document.createTextNode(e2))), n2;
        });
      }
      function C(e2) {
        return n.inlineAll(e2).then(function() {
          return e2;
        });
      }
      function x(e2, t2, n2, r2) {
        var o2 = 0 <= ["background-clip"].indexOf(t2);
        r2 ? (e2.setProperty(t2, n2, r2), o2 && e2.setProperty("-webkit-" + t2, n2, r2)) : (e2.setProperty(t2, n2), o2 && e2.setProperty("-webkit-" + t2, n2));
      }
      let M = Symbol("dtim-ua-relative-font-size");
      function I(o2, i2, l2, s2, e2) {
        let u2 = v.impl.options.copyDefaultStyles ? ((t2, e3) => {
          var n2, r3 = ((e4) => {
            var t3 = [];
            do {
              if (e4.nodeType === w) {
                var n3 = e4.tagName;
                if (t3.push(n3), N.includes(n3))
                  break;
              }
            } while (e4 = e4.parentNode);
            return t3;
          })(e3), o3 = ((e4) => ("relaxed" !== t2.styleCaching ? e4 : e4.filter((e5, t3, n3) => 0 === t3 || t3 === n3.length - 1)).join(">"))(r3) + ((t3) => t3 && t3.hasAttribute ? O.filter(function(e4) {
            return t3.hasAttribute(e4);
          }).map(function(e4) {
            return `[${e4}]`;
          }).join("") : "")(e3);
          {
            if (V[o3])
              return V[o3];
            n2 = (() => {
              if (P)
                return P.contentWindow;
              t3 = document.characterSet || "UTF-8", e4 = (e4 = document.doctype) ? (`<!DOCTYPE ${s4(e4.name)} ${s4(e4.publicId)} ` + s4(e4.systemId)).trim() + ">" : "", (P = document.createElement("iframe")).id = "domtoimage-sandbox-" + p.uid(), Object.assign(P.style, h), document.body.appendChild(P);
              var e4, t3, n3 = P, r4 = "domtoimage-sandbox";
              try {
                return n3.contentWindow.document.write(e4 + `<html><head><meta charset='${t3}'><title>${r4}</title></head><body></body></html>`), n3.contentWindow;
              } catch (e5) {
              }
              var o4 = document.createElement("meta");
              o4.setAttribute("charset", t3);
              try {
                var i4 = document.implementation.createHTMLDocument(r4), l4 = (i4.head.appendChild(o4), e4 + i4.documentElement.outerHTML);
                return n3.setAttribute("srcdoc", l4), n3.contentWindow;
              } catch (e5) {
              }
              return n3.contentDocument.head.appendChild(o4), n3.contentDocument.title = r4, n3.contentWindow;
              function s4(e5) {
                var t4;
                return e5 ? ((t4 = document.createElement("div")).innerText = e5, t4.innerHTML) : "";
              }
            })();
            var i3 = r3 = ((e4, t3) => {
              let n3 = e4.body;
              do {
                var r4 = t3.pop(), r4 = e4.createElement(r4);
                n3.appendChild(r4), n3 = r4;
              } while (0 < t3.length);
              return n3.textContent = "\u200B", n3;
            })(n2.document, r3), l3 = e3, s3 = (l3 && l3.hasAttribute && O.forEach(function(e4) {
              l3.hasAttribute(e4) && i3.setAttribute(e4, l3.getAttribute(e4));
            }), e3 = ((e4, t3) => {
              let n3 = {}, r4 = e4.getComputedStyle(t3), o4 = (p.asArray(r4).forEach(function(e5) {
                n3[e5] = "width" === e5 || "height" === e5 ? "auto" : r4.getPropertyValue(e5);
              }), t3.parentElement);
              return o4 && (t3 = e4.getComputedStyle(o4).getPropertyValue("font-size"), n3[M] = n3["font-size"] !== t3), n3;
            })(n2, r3), r3);
            do {
              var u3 = s3.parentElement;
              null !== u3 && u3.removeChild(s3), s3 = u3;
            } while (s3 && "BODY" !== s3.tagName);
            return V[o3] = e3;
          }
        })(o2, i2) : {}, a2 = e2.style;
        var r2, c2;
        p.asArray(l2).forEach(function(e3) {
          var t2, n2, r3;
          o2.filterStyles && !o2.filterStyles(i2, e3) || (t2 = l2.getPropertyValue(e3), r3 = u2[e3], n2 = s2 ? s2.getPropertyValue(e3) : void 0, a2.getPropertyValue(e3)) || (t2 !== r3 || s2 && t2 !== n2 || "font-size" === e3 && u2[M]) && (r3 = l2.getPropertyPriority(e3), x(a2, e3, t2, r3));
        }), r2 = l2, c2 = a2, ["top", "right", "bottom", "left"].forEach(function(e3) {
          var t2, n2 = `border-${e3}-width`, e3 = r2.getPropertyValue(`border-${e3}-style`);
          e3 && "none" !== e3 && !c2.getPropertyValue(n2) && (e3 = r2.getPropertyValue(n2)) && (t2 = r2.getPropertyPriority(n2), x(c2, n2, e3, t2));
        });
      }
      let L = null, V = {}, N = ["ADDRESS", "ARTICLE", "ASIDE", "BLOCKQUOTE", "DETAILS", "DIALOG", "DD", "DIV", "DL", "DT", "FIELDSET", "FIGCAPTION", "FIGURE", "FOOTER", "FORM", "H1", "H2", "H3", "H4", "H5", "H6", "HEADER", "HGROUP", "HR", "LI", "MAIN", "NAV", "OL", "P", "PRE", "SECTION", "SVG", "TABLE", "UL", "math", "svg", "BODY", "HEAD", "HTML"], O = ["href"];
    })(exports);
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => BlackHolePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// src/settings.ts
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  sizeMode: 1,
  tokenMetric: "word-count",
  maxWordCount: 5e3,
  holeRadius: 0.02,
  lensDepth: 13,
  starGain: 0,
  diskInner: 1.8,
  diskOuter: 8,
  diskIncl: 1.5,
  diskRoll: 0.35,
  diskGain: 2.2,
  diskOpacity: 0.9,
  diskTemp: 5500,
  dopplerMix: 0.6,
  diskBeam: 2.5,
  diskSpeed: 5,
  diskWind: 7,
  diskContrast: 1.6,
  exposure: 1.4,
  driftSpeed: 1,
  workArea: 0.33,
  dilationMin: 0.2,
  tokenAreaMin: 0.01,
  tokenAreaMax: 0.5,
  tokenHomeX: 0.96,
  tokenHomeY: 0.04,
  tokenEase: 1,
  tokenReach: 1,
  tokenCalm: 0.04,
  tokenRush: 1.1,
  nSteps: 48,
  workPeriodMin: 55,
  breakMin: 5,
  idleFadeSec: 90
};
var BlackHoleSettingsTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Black Hole Settings" });
    new import_obsidian.Setting(containerEl).setName("Size Mode").setDesc("What drives the hole's growth").addDropdown((dd) => {
      dd.addOption("0", "Pomodoro \u2014 wall-clock work/break cycle");
      dd.addOption("1", "Token \u2014 word count / custom metric");
      dd.addOption("2", "Demo \u2014 self-running showcase loop");
      dd.setValue(String(this.plugin.settings.sizeMode));
      dd.onChange(async (v) => {
        this.plugin.settings.sizeMode = parseInt(v);
        await this.plugin.saveSettings();
        this.plugin.onModeChange();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Token Metric").setDesc("What drives the hole in token mode").addDropdown((dd) => {
      dd.addOption("word-count", "Current note word count");
      dd.addOption("global-word-count", "Vault-wide word count");
      dd.addOption("file-count", "Vault file count");
      dd.addOption("tab-count", "Open tab count");
      dd.setValue(this.plugin.settings.tokenMetric);
      dd.onChange(async (v) => {
        this.plugin.settings.tokenMetric = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Max Word Count").setDesc("Word count at which the hole reaches 100% size (token mode)").addSlider((sl) => {
      sl.setLimits(100, 5e4, 100);
      sl.setValue(this.plugin.settings.maxWordCount);
      sl.onChange(async (v) => {
        this.plugin.settings.maxWordCount = v;
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("h3", { text: "Pomodoro" });
    new import_obsidian.Setting(containerEl).setName("Work Period (min)").addSlider((sl) => {
      sl.setLimits(10, 120, 1);
      sl.setValue(this.plugin.settings.workPeriodMin);
      sl.onChange(async (v) => {
        this.plugin.settings.workPeriodMin = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Break (min)").addSlider((sl) => {
      sl.setLimits(1, 30, 1);
      sl.setValue(this.plugin.settings.breakMin);
      sl.onChange(async (v) => {
        this.plugin.settings.breakMin = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName("Idle Fade (sec)").setDesc("Typing pause after which the hole starts to shrink").addSlider((sl) => {
      sl.setLimits(10, 600, 5);
      sl.setValue(this.plugin.settings.idleFadeSec);
      sl.onChange(async (v) => {
        this.plugin.settings.idleFadeSec = v;
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("h3", { text: "Hole & Lensing" });
    this.slider("Hole Radius", this.plugin.settings.holeRadius, 1e-3, 0.2, 1e-3, (v) => {
      this.plugin.settings.holeRadius = v;
    });
    this.slider("Lens Depth", this.plugin.settings.lensDepth, 1, 50, 0.5, (v) => {
      this.plugin.settings.lensDepth = v;
    });
    this.slider("Star Gain", this.plugin.settings.starGain, 0, 5, 0.1, (v) => {
      this.plugin.settings.starGain = v;
    });
    containerEl.createEl("h3", { text: "Accretion Disk" });
    this.slider("Disk Inner", this.plugin.settings.diskInner, 1.6, 10, 0.1, (v) => {
      this.plugin.settings.diskInner = v;
    });
    this.slider("Disk Outer", this.plugin.settings.diskOuter, 3, 30, 0.5, (v) => {
      this.plugin.settings.diskOuter = v;
    });
    this.slider("Inclination", this.plugin.settings.diskIncl, 0, 3.14, 0.01, (v) => {
      this.plugin.settings.diskIncl = v;
    });
    this.slider("Roll", this.plugin.settings.diskRoll, -3.14, 3.14, 0.01, (v) => {
      this.plugin.settings.diskRoll = v;
    });
    this.slider("Gain", this.plugin.settings.diskGain, 0, 10, 0.1, (v) => {
      this.plugin.settings.diskGain = v;
    });
    this.slider("Opacity", this.plugin.settings.diskOpacity, 0, 1, 0.01, (v) => {
      this.plugin.settings.diskOpacity = v;
    });
    this.slider("Temperature (K)", this.plugin.settings.diskTemp, 1500, 4e4, 100, (v) => {
      this.plugin.settings.diskTemp = v;
    });
    this.slider("Doppler Mix", this.plugin.settings.dopplerMix, 0, 1, 0.01, (v) => {
      this.plugin.settings.dopplerMix = v;
    });
    this.slider("Beaming", this.plugin.settings.diskBeam, 0, 10, 0.1, (v) => {
      this.plugin.settings.diskBeam = v;
    });
    containerEl.createEl("h3", { text: "Performance" });
    new import_obsidian.Setting(containerEl).setName("Integration Steps").setDesc("Geodesic steps per pixel \u2014 higher = more accurate but slower").addSlider((sl) => {
      sl.setLimits(8, 128, 2);
      sl.setValue(this.plugin.settings.nSteps);
      sl.onChange(async (v) => {
        this.plugin.settings.nSteps = v;
        await this.plugin.saveSettings();
      });
    });
    this.slider("Token Area Max (\xD71e-3)", this.plugin.settings.tokenAreaMax * 1e3, 0.1, 20, 0.1, (v) => {
      this.plugin.settings.tokenAreaMax = v / 1e3;
    });
  }
  slider(name, value, min, max, step, onChange) {
    new import_obsidian.Setting(this.containerEl).setName(name).addSlider((sl) => {
      sl.setLimits(min, max, step);
      sl.setValue(value);
      sl.onChange(async (v) => {
        onChange(v);
        await this.plugin.saveSettings();
        this.plugin.onModeChange();
      });
    }).addText((txt) => {
      txt.setValue(String(value));
      txt.onChange(async (s) => {
        const v = parseFloat(s);
        if (!isNaN(v) && v >= min && v <= max) {
          onChange(v);
          await this.plugin.saveSettings();
        }
      });
    });
  }
};

// src/shader.ts
var VS = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
}
`;
function makeFS(p) {
  return `#version 300 es
precision highp float;
precision highp int;

// ---- uniforms (set by renderer every frame) ----
uniform vec2  uResolution;
uniform float uTime;
uniform float uTimeDelta;
uniform int   uFrame;
uniform sampler2D uTexture;
uniform vec4  uDate;
uniform float uLastActivity;
uniform float uTokenLevel;
uniform int   uSizeMode;

in vec2 vUv;
out vec4 fragColor;

// ---- tunable consts (injected from settings) ----
const float HOLE_RADIUS   = ${p.holeRadius.toFixed(4)};
const float LENS_DEPTH    = ${p.lensDepth.toFixed(4)};
const float STAR_GAIN     = ${p.starGain.toFixed(4)};
const float DISK_INNER    = ${p.diskInner.toFixed(4)};
const float DISK_OUTER    = ${p.diskOuter.toFixed(4)};
const float DISK_INCL     = ${p.diskIncl.toFixed(4)};
const float DISK_ROLL     = ${p.diskRoll.toFixed(4)};
const float DISK_GAIN     = ${p.diskGain.toFixed(4)};
const float DISK_OPACITY  = ${p.diskOpacity.toFixed(4)};
const float DISK_TEMP     = ${p.diskTemp.toFixed(4)};
const float DOPPLER_MIX   = ${p.dopplerMix.toFixed(4)};
const float DISK_BEAM     = ${p.diskBeam.toFixed(4)};
const float DISK_SPEED    = ${p.diskSpeed.toFixed(4)};
const float DISK_WIND     = ${p.diskWind.toFixed(4)};
const float DISK_CONTRAST = ${p.diskContrast.toFixed(4)};
const float EXPOSURE      = ${p.exposure.toFixed(4)};
const float DRIFT_SPEED   = ${p.driftSpeed.toFixed(4)};
const float WORK_AREA     = ${p.workArea.toFixed(4)};
const float DILATION_MIN  = ${p.dilationMin.toFixed(4)};
const float TOKEN_AREA_MIN= ${p.tokenAreaMin.toFixed(4)};
const float TOKEN_AREA_MAX= ${p.tokenAreaMax.toFixed(4)};
const float TOKEN_HOME_X  = ${p.tokenHomeX.toFixed(4)};
const float TOKEN_HOME_Y  = ${p.tokenHomeY.toFixed(4)};
const float TOKEN_EASE    = ${p.tokenEase.toFixed(4)};
const float TOKEN_REACH   = ${p.tokenReach.toFixed(4)};
const float TOKEN_CALM    = ${p.tokenCalm.toFixed(4)};
const float TOKEN_RUSH    = ${p.tokenRush.toFixed(4)};
const float WORK_PERIOD_MIN = ${p.workPeriodMin.toFixed(4)};
const float BREAK_MIN       = ${p.breakMin.toFixed(4)};
const float IDLE_FADE_SEC   = ${p.idleFadeSec.toFixed(4)};
const float TOKEN_GLIDE_MIN  = ${p.tokenGlideMin.toFixed(4)};
const float TOKEN_GLIDE_MAX  = ${p.tokenGlideMax.toFixed(4)};
const float TOKEN_GLIDE_RATE = ${p.tokenGlideRate.toFixed(4)};
const float TIME_SCALE      = 1.0000;
const float DEMO_SEC        = 42.0000;
const float DEMO_GROW_SEC   = 40.0000;
const float DEMO_XFADE      = 0.1800;

const int N_STEPS = ${p.nSteps};
const int MODE_POMODORO = 0;
const int MODE_TOKENS   = 1;
const int MODE_DEMO     = 2;
#define B_CRIT 2.5980762

// ------------------------------------------------------------------- noise --
float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
}

float vnoiseWrapY(vec2 p, float perY) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float y0 = mod(i.y, perY), y1 = mod(i.y + 1.0, perY);
    return mix(mix(hash21(vec2(i.x, y0)),       hash21(vec2(i.x + 1.0, y0)), f.x),
               mix(hash21(vec2(i.x, y1)),       hash21(vec2(i.x + 1.0, y1)), f.x),
               f.y);
}

vec2 mirrorUV(vec2 u) { return 1.0 - abs(1.0 - mod(u, 2.0)); }

vec2 rot(vec2 v, float a) {
    float c = cos(a), s = sin(a);
    return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

vec2 lissa(float t) {
    return vec2(0.75 * sin(t * 0.37) + 0.25 * sin(t * 0.83 + 1.0),
                0.70 * sin(t * 0.54 + 2.1) + 0.30 * sin(t * 1.07));
}

vec3 blackbody(float T) {
    float t = clamp(T, 1500.0, 40000.0) / 100.0;
    float r = t <= 66.0 ? 1.0
                        : clamp(1.292936 * pow(t - 60.0, -0.1332047), 0.0, 1.0);
    float g = t <= 66.0 ? clamp(0.3900816 * log(t) - 0.6318414, 0.0, 1.0)
                        : clamp(1.1298909 * pow(t - 60.0, -0.0755148), 0.0, 1.0);
    float b = t >= 66.0 ? 1.0
                        : (t <= 19.0 ? 0.0
                                     : clamp(0.5432068 * log(t - 10.0) - 1.1962540, 0.0, 1.0));
    return vec3(r, g, b);
}

vec3 stars(vec3 d) {
    vec2 sph = vec2(atan(d.x, -d.z), asin(clamp(d.y, -1.0, 1.0)));
    vec2 g   = sph * 40.0;
    vec2 id  = floor(g);
    float h  = hash21(id);
    if (h < 0.92) return vec3(0.0);
    vec2 f   = fract(g) - 0.5;
    vec2 off = (vec2(hash21(id + 17.3), hash21(id + 31.7)) - 0.5) * 0.7;
    float spark = smoothstep(0.10, 0.0, length(f - off));
    float tw    = 0.7 + 0.3 * sin(uTime * (0.5 + 2.0 * hash21(id + 5.1)) + 40.0 * h);
    vec3 tint   = mix(vec3(1.0, 0.82, 0.60), vec3(0.75, 0.85, 1.0), hash21(id + 2.9));
    return tint * spark * tw * ((h - 0.92) / 0.08);
}

// ------------------------------------------------------------- demo look --
struct DiskLook {
    float temp, incl, roll, inner, outer, opac, dopp, beam,
          gain, contr, wind, speed, expo, star;
};

const DiskLook LOOK_DEFAULT = DiskLook(
    DISK_TEMP, DISK_INCL, DISK_ROLL, DISK_INNER, DISK_OUTER, DISK_OPACITY,
    DOPPLER_MIX, DISK_BEAM, DISK_GAIN, DISK_CONTRAST, DISK_WIND, DISK_SPEED,
    EXPOSURE, STAR_GAIN);

#define DEMO_N 8
const DiskLook DEMO_TOUR[DEMO_N] = DiskLook[DEMO_N](
    DiskLook( 5500.0, 1.50,  0.35, 1.8,  8.0, 0.90, 0.60, 2.5, 2.2, 1.6, 7.0, 5.0, 1.40, 0.0),
    DiskLook( 4500.0, 1.52,  0.10, 2.2,  7.0, 0.85, 0.35, 2.0, 1.4, 0.5, 7.0, 5.0, 1.20, 0.0),
    DiskLook( 3800.0, 0.55, -0.30, 2.2,  6.0, 0.45, 0.90, 3.5, 1.6, 0.4, 3.0, 2.5, 1.10, 0.0),
    DiskLook( 6500.0, 0.30,  0.00, 3.0, 10.0, 0.50, 0.80, 2.5, 1.0, 1.1, 7.0, 5.0, 1.00, 0.0),
    DiskLook(15000.0, 1.30,  0.35, 3.0, 14.0, 0.35, 1.00, 4.0, 1.2, 1.3, 8.0, 5.0, 0.80, 0.0),
    DiskLook(18000.0, 1.05,  0.55, 3.0, 16.0, 0.30, 1.00, 5.0, 1.0, 1.5, 9.0, 6.0, 0.75, 0.0),
    DiskLook( 5500.0, 1.50,  0.35, 1.8,  8.0, 0.00, 1.00, 2.5, 0.0, 1.6, 7.0, 5.0, 1.00, 0.6),
    DiskLook( 5500.0, 1.50,  0.35, 1.8,  8.0, 0.90, 0.60, 2.5, 2.2, 1.6, 7.0, 5.0, 1.40, 0.0));

DiskLook mixLook(DiskLook a, DiskLook b, float f) {
    return DiskLook(
        mix(a.temp,  b.temp,  f), mix(a.incl,  b.incl,  f),
        mix(a.roll,  b.roll,  f), mix(a.inner, b.inner, f),
        mix(a.outer, b.outer, f), mix(a.opac,  b.opac,  f),
        mix(a.dopp,  b.dopp,  f), mix(a.beam,  b.beam,  f),
        mix(a.gain,  b.gain,  f), mix(a.contr, b.contr, f),
        mix(a.wind,  b.wind,  f), mix(a.speed, b.speed, f),
        mix(a.expo,  b.expo,  f), mix(a.star,  b.star,  f));
}

DiskLook demoLook() {
    float u = mod(uTime, DEMO_SEC) / DEMO_SEC * float(DEMO_N);
    int   i = int(min(u, float(DEMO_N) - 0.001));
    float f = smoothstep(1.0 - DEMO_XFADE, 1.0, fract(u));
    return mixLook(DEMO_TOUR[i], DEMO_TOUR[(i + 1) % DEMO_N], f);
}

// --------------------------------------------------------------- token glide --
float glidedToken(float cur, float prev, float tChange) {
    if (cur < 0.0) return -1.0;
    if (prev < 0.0) return cur;
    float T = clamp(abs(cur - prev) * TOKEN_GLIDE_RATE, TOKEN_GLIDE_MIN, TOKEN_GLIDE_MAX);
    return mix(prev, cur, smoothstep(0.0, T, uTime - tChange));
}

// ------------------------------------------------------------------- image --
void main() {
    vec2 uv = vUv;
    vec2  res    = uResolution;
    float aspect = res.x / res.y;
    float yUp = 1.0 - uv.y;
    float t = uTime * DRIFT_SPEED;

    DiskLook L = LOOK_DEFAULT;
    if (uSizeMode == MODE_DEMO) L = demoLook();

    float rin  = max(L.inner, 1.6);
    float rout = max(L.outer, rin + 0.5);

    float I, sz;
    vec2  center;

    if (uSizeMode == MODE_POMODORO) {
        float workSec  = WORK_PERIOD_MIN * 60.0;
        float cycleSec = workSec + BREAK_MIN * 60.0;
        float wall     = uDate.w + uTime * (TIME_SCALE - 1.0);
        float phase    = mod(wall, cycleSec);
        float collapse = min(60.0, workSec * 0.15);
        float grow = clamp(phase / workSec, 0.0, 1.0)
                   * (1.0 - smoothstep(workSec - collapse, workSec, phase));
        I = mix(0.12, 1.0, grow);
        float idle = max(0.0, uTime - uLastActivity);
        I *= 1.0 - smoothstep(IDLE_FADE_SEC, max(BREAK_MIN * 60.0, IDLE_FADE_SEC + 1.0), idle);
        sz = mix(0.22, 1.0, I);
        float ext = (rout / B_CRIT) * HOLE_RADIUS * sz;
        float yLo = WORK_AREA + 0.12 + ext;
        float yHi = max(yLo, 0.90 - ext);
        float spd = mix(0.35, 1.0, I);
        center = vec2(
            0.5 + (0.24 * sin(t * 0.21) + 0.05 * sin(t * 0.083)) * spd,
            1.0 - mix(yLo, yHi, 0.5 + (0.42 * sin(t * 0.157 + 2.0) + 0.08 * sin(t * 0.117)) * spd));
        center += I * vec2(0.040 * sin(t * 0.83) + 0.020 * sin(t * 1.31),
                           0.030 * sin(t * 1.03 + 1.0));
    } else {
        float lvl;
        if (uSizeMode == MODE_DEMO) {
            lvl = min(mod(uTime, DEMO_SEC) / DEMO_GROW_SEC, 1.0);
        } else {
            lvl = uTokenLevel;
        }
        if (lvl < 0.0) { fragColor = texture(uTexture, uv); return; }
        float g = pow(clamp(lvl, 0.0, 1.0), TOKEN_EASE);
        I = mix(0.10, 1.0, g);
        float rhMin = sqrt(TOKEN_AREA_MIN * aspect / 3.1415927);
        float rhMax = sqrt(TOKEN_AREA_MAX * aspect / 3.1415927);
        float rhT = mix(rhMin, rhMax, g) * (HOLE_RADIUS / 0.08);
        sz = rhT / max(HOLE_RADIUS, 1e-4);
        float marg = min(rhT * mix(1.45, 0.90, g), 0.5 * (1.0 - WORK_AREA - 0.03));
        float xPad = marg / aspect;
        vec2  fullLo = vec2(min(xPad, 0.5), marg);
        vec2  fullHi = vec2(max(0.5, 1.0 - xPad),
                            max(marg, 1.0 - (WORK_AREA + 0.03 + marg)));
        vec2  corner = clamp(vec2(TOKEN_HOME_X, TOKEN_HOME_Y), fullLo, fullHi);
        float reach  = mix(0.06, max(TOKEN_REACH, 0.06), g);
        vec2  lo = vec2(mix(corner.x, fullLo.x, reach), fullLo.y);
        vec2  hi = vec2(fullHi.x, mix(corner.y, fullHi.y, reach));
        vec2  room   = max((hi - lo) * 0.5, vec2(0.0));
        vec2  wobAmp = min(vec2(0.010 + 0.030 * g), max(room * 0.35, vec2(0.006)));
        vec2  ampEff = max(room - wobAmp, vec2(0.0));
        vec2  wander = mix(lissa(t * TOKEN_CALM), lissa(t * TOKEN_RUSH), g);
        center = (lo + hi) * 0.5 + wander * ampEff
               + wobAmp * vec2(cos(t * 0.8), sin(t * 1.0));
    }

    float vis = smoothstep(0.0, 0.10, I);
    if (vis <= 0.0) {
        fragColor = texture(uTexture, uv);
        return;
    }
    float rh = HOLE_RADIUS * sz;
    float dil = mix(1.0, DILATION_MIN, I);
    float shield = vis * smoothstep(WORK_AREA, WORK_AREA + 0.18, yUp);

    vec2  p    = (uv - center) * vec2(aspect, 1.0);
    float plen = length(p);

    float W  = B_CRIT / max(rh, 1e-4);
    vec2  pr = rot(vec2(p.x, -p.y), L.roll) * W;
    float b  = length(pr);

    float window = exp(-pow(plen / (7.0 * rh), 2.0));

    float bmax = rout + 3.0;
    float Z0   = max(14.0, rout + 5.0);

    // far field
    if (b >= bmax) {
        float uu   = Z0 * inversesqrt(Z0 * Z0 + b * b);
        float defl = (2.0 / (W * W)) / max(plen, 1e-4)
                   * (1.29 * uu + 0.07) * max(LENS_DEPTH - 2.14 * uu + 0.75, 0.0)
                   * window * shield;
        vec2  dir  = p / max(plen, 1e-5);
        vec3  term;
        float ab = 0.035 * smoothstep(1.0, 2.0, b / bmax);
        for (int i = 0; i < 3; i++) {
            float k   = 1.0 + (float(i) - 1.0) * ab;
            vec2  sp  = p - dir * defl * k;
            vec2  suv = mirrorUV(center + sp / vec2(aspect, 1.0));
            term[i]   = texture(uTexture, suv)[i];
        }
        vec3 dd = normalize(vec3(-(pr / b) * (2.0 / b), -1.0));
        fragColor = vec4(term + stars(dd) * STAR_GAIN * window * shield, 1.0);
        return;
    }

    // near field: geodesic trace
    vec3  x  = vec3(pr, Z0);
    vec3  v  = vec3(0.0, 0.0, -1.0);
    float h2 = dot(pr, pr);

    float ci = cos(L.incl), si = sin(L.incl);
    vec3  n  = vec3(0.0, si, ci);
    vec3  e2 = vec3(0.0, ci, -si);
    float sdir = L.speed < 0.0 ? -1.0 : 1.0;
    float spd  = abs(L.speed);

    vec3  emitc = vec3(0.0);
    float trans = 1.0;
    bool  captured = false;
    float sPrev = dot(x, n);
    vec3  xPrev = x;

    for (int i = 0; i < N_STEPS; i++) {
        float r2 = dot(x, x);
        if (r2 < 1.0) { captured = true; break; }
        if (x.z < -Z0 && v.z < 0.0) break;
        if (r2 > 4.0 * Z0 * Z0) break;
        float r  = sqrt(r2);
        float dt = clamp(0.16 * r, 0.03, 1.5);
        vec3 a = -1.5 * h2 * x / (r2 * r2 * r);
        v += a * (0.5 * dt);
        x += v * dt;
        r2 = dot(x, x);
        r  = sqrt(r2);
        a  = -1.5 * h2 * x / (r2 * r2 * r);
        v += a * (0.5 * dt);

        float s = dot(x, n);
        if (s * sPrev < 0.0 && trans > 0.02) {
            float tc = sPrev / (sPrev - s);
            vec3  xc = mix(xPrev, x, tc);
            float rc = length(xc);
            if (rc > rin && rc < rout) {
                float band = smoothstep(rin, rin * 1.25, rc)
                           * (1.0 - smoothstep(rout * 0.70, rout, rc));
                float phi   = atan(dot(xc, e2), xc.x);
                float turns = phi / 6.2831853;
                float kep   = pow(rin / rc, 1.5);
                float gloc  = sqrt(max(1.0 - 1.5 / rc, 0.02));
                float swirl = rc * L.wind * 0.12 - t * kep * spd * gloc * dil * sdir;
                float streaks = vnoiseWrapY(vec2(rc * 2.8, turns * 19.0 + swirl * 3.0), 19.0) * 0.65 +
                                vnoiseWrapY(vec2(rc * 1.0, turns * 9.0  + swirl * 1.5 + 7.0), 9.0) * 0.35;
                streaks = 0.35 + L.contr * streaks * streaks;
                vec3  gasdir = normalize(cross(n, xc)) * sdir;
                float beta   = clamp(inversesqrt(max(2.0 * (rc - 1.0), 0.2)), 0.0, 0.99);
                float gg     = gloc / max(1.0 + beta * dot(gasdir, normalize(v)), 0.05);
                gg = mix(1.0, gg, L.dopp);
                float xpr   = max(1.0 - sqrt(rin / rc), 0.0);
                float tprof = pow(rin / rc, 0.75) * pow(xpr, 0.25) / 0.488;
                vec3  cbb   = blackbody(L.temp * tprof * gg);
                float boost = pow(gg, L.beam);
                float density = band * streaks;
                emitc += trans * cbb * (L.gain * 2.2 * density * tprof * tprof * boost);
                trans *= 1.0 - clamp(L.opac * density, 0.0, 1.0);
            }
        }
        sPrev = s;
        xPrev = x;
    }
    if (!captured && dot(x, x) < 4.0) captured = true;

    vec3 bg = vec3(0.0);
    if (!captured) {
        vec3 dd = normalize(v);
        bg += stars(dd) * STAR_GAIN * window * shield;
        if (dd.z < -0.05) {
            float tpl = (-LENS_DEPTH - x.z) / dd.z;
            vec3  hp  = x + dd * tpl;
            vec2  q   = rot(hp.xy, -L.roll) / W;
            vec2  sp  = vec2(q.x, -q.y);
            vec2  suv = mirrorUV(center + (p + (sp - p) * window * shield) / vec2(aspect, 1.0));
            float toward = smoothstep(0.05, 0.35, -dd.z);
            bg += texture(uTexture, suv).rgb * toward;
        }
    }

    vec3 col = bg * trans + (vec3(1.0) - exp(-emitc * L.expo));
    fragColor = vec4(col, 1.0);
}
`;
}

// src/renderer.ts
var BlackHoleRenderer = class {
  constructor(canvas, params) {
    this.gl = null;
    this.program = null;
    this.vao = null;
    this.animId = 0;
    this.running = false;
    this.workspaceTex = null;
    // state
    this.tokenLevel = 0;
    this.prevTokenLevel = 0;
    this.lastTokenChange = 0;
    this.lastActivity = 0;
    this.sizeMode = 1;
    this.prevTime = 0;
    this.frameCount = 0;
    this.loop = (now) => {
      if (!this.running || !this.gl || !this.program)
        return;
      this.animId = requestAnimationFrame(this.loop);
      const gl = this.gl;
      const dt = Math.min((now - this.prevTime) / 1e3, 0.1);
      this.prevTime = now;
      this.frameCount++;
      gl.useProgram(this.program);
      gl.uniform2f(this.uResolution, this.canvas.width, this.canvas.height);
      gl.uniform1f(this.uTime, now / 1e3);
      gl.uniform1f(this.uTimeDelta, dt);
      gl.uniform1i(this.uFrame, this.frameCount);
      gl.uniform1f(this.uLastActivity, this.lastActivity);
      const d = /* @__PURE__ */ new Date();
      gl.uniform4f(
        this.uDate,
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate(),
        d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()
      );
      if (this.prevTokenLevel !== this.tokenLevel) {
        this.prevTokenLevel = this.tokenLevel;
        this.lastTokenChange = now / 1e3;
      }
      gl.uniform1f(this.uTokenLevel, this.tokenLevel);
      gl.uniform1i(this.uSizeMode, this.sizeMode);
      gl.bindVertexArray(this.vao);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindVertexArray(null);
    };
    this.canvas = canvas;
    this.params = { ...params };
    this.resizeObserver = new ResizeObserver(() => this.resize());
  }
  init() {
    const gl = this.canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      preserveDrawingBuffer: false
    });
    if (!gl)
      return false;
    this.gl = gl;
    if (!this.buildProgram())
      return false;
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(this.program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    this.workspaceTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.workspaceTex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255])
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(this.uTexture, 0);
    this.resize();
    this.resizeObserver.observe(this.canvas.parentElement ?? document.body);
    return true;
  }
  /** Recompile with new shader params (e.g. after settings change). */
  recompile(params) {
    this.params = { ...params };
    const oldProgram = this.program;
    if (!this.buildProgram())
      return;
    if (oldProgram && this.gl)
      this.gl.deleteProgram(oldProgram);
  }
  start() {
    if (this.running)
      return;
    this.running = true;
    this.prevTime = performance.now();
    this.loop(this.prevTime);
  }
  stop() {
    this.running = false;
    if (this.animId)
      cancelAnimationFrame(this.animId);
    this.animId = 0;
  }
  /** Upload a captured workspace canvas to the texture. */
  updateTexture(captureCanvas) {
    if (!this.gl || !this.workspaceTex)
      return;
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.workspaceTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, captureCanvas);
  }
  resize() {
    if (!this.gl)
      return;
    const parent = this.canvas.parentElement;
    if (!parent)
      return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (w === 0 || h === 0)
      return;
    this.canvas.width = w;
    this.canvas.height = h;
    this.gl.viewport(0, 0, w, h);
  }
  getSize() {
    return { width: this.canvas.width, height: this.canvas.height };
  }
  destroy() {
    this.stop();
    this.resizeObserver.disconnect();
    const gl = this.gl;
    if (gl && this.program)
      gl.deleteProgram(this.program);
    if (gl && this.workspaceTex)
      gl.deleteTexture(this.workspaceTex);
    this.gl = null;
  }
  // ---- internal ----
  buildProgram() {
    const gl = this.gl;
    const vs = this.compile(gl.VERTEX_SHADER, VS);
    const fs = this.compile(gl.FRAGMENT_SHADER, makeFS(this.params));
    if (!vs || !fs)
      return false;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("Shader link error:", gl.getProgramInfoLog(prog));
      return false;
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    this.program = prog;
    gl.useProgram(prog);
    this.uResolution = gl.getUniformLocation(prog, "uResolution");
    this.uTime = gl.getUniformLocation(prog, "uTime");
    this.uTimeDelta = gl.getUniformLocation(prog, "uTimeDelta");
    this.uFrame = gl.getUniformLocation(prog, "uFrame");
    this.uTexture = gl.getUniformLocation(prog, "uTexture");
    this.uDate = gl.getUniformLocation(prog, "uDate");
    this.uLastActivity = gl.getUniformLocation(prog, "uLastActivity");
    this.uTokenLevel = gl.getUniformLocation(prog, "uTokenLevel");
    this.uSizeMode = gl.getUniformLocation(prog, "uSizeMode");
    return true;
  }
  compile(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compile error:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
};

// src/capture.ts
var domToImage = __toESM(require_dom_to_image_more_min());
var CAPTURE_INTERVAL = 350;
var CAPTURE_SCALE = 0.5;
var WorkspaceCapture = class {
  constructor() {
    this.lastCapture = 0;
    this.el = null;
    this.failed = false;
    /** The most recent successfully captured canvas. */
    this.latestCanvas = null;
    /** Time of the latest successful capture (monotonic). */
    this.latestCaptureTime = 0;
  }
  setElement(el) {
    this.el = el;
  }
  /**
   * Trigger an async capture. Returns `true` if a capture was initiated.
   * Resolves by updating `latestCanvas` when dom-to-image finishes.
   * Rate-limited internally.
   */
  capture(now) {
    if (this.failed || !this.el)
      return false;
    if (now - this.lastCapture < CAPTURE_INTERVAL)
      return false;
    this.lastCapture = now;
    const el = this.el;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w === 0 || h === 0)
      return false;
    domToImage.toCanvas(el, {
      width: Math.round(w * CAPTURE_SCALE),
      height: Math.round(h * CAPTURE_SCALE),
      scale: CAPTURE_SCALE,
      filter: (n) => {
        if (n instanceof HTMLElement && n.classList.contains("blackhole-canvas"))
          return false;
        return true;
      }
    }).then((canvas) => {
      this.latestCanvas = canvas;
      this.latestCaptureTime = performance.now();
    }).catch(() => {
    });
    return true;
  }
  /** Reset failure state. */
  reset() {
    this.failed = false;
  }
  /**
   * Try to take a synchronous capture (won't reflect latest DOM changes
   * but gives us something to start with).
   */
  static blankCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.round(w * CAPTURE_SCALE);
    c.height = Math.round(h * CAPTURE_SCALE);
    return c;
  }
};

// src/main.ts
var BlackHolePlugin = class extends import_obsidian2.Plugin {
  constructor() {
    super(...arguments);
    this.settings = { ...DEFAULT_SETTINGS };
    this.renderer = null;
    this.capture = null;
    this.canvas = null;
    this.enabled = true;
    this.lastActivity = 0;
    this.captureIntervalId = 0;
    this.metricIntervalId = 0;
    this.domObserver = null;
    this.activityHandler = () => {
      this.lastActivity = performance.now();
      if (this.renderer)
        this.renderer.lastActivity = this.lastActivity / 1e3;
    };
  }
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new BlackHoleSettingsTab(this.app, this));
    this.addRibbonIcon("goal", "Toggle Black Hole", () => {
      this.enabled = !this.enabled;
      if (this.enabled)
        this.start();
      else
        this.stop();
      new import_obsidian2.Notice(`Black hole ${this.enabled ? "ON" : "OFF"}`);
    });
    if (this.enabled)
      this.start();
  }
  onunload() {
    this.stop();
  }
  start() {
    if (this.renderer)
      return;
    const canvas = document.createElement("canvas");
    canvas.className = "blackhole-canvas";
    this.canvas = canvas;
    const workspace = document.querySelector(".workspace");
    if (workspace)
      workspace.appendChild(canvas);
    else
      document.body.appendChild(canvas);
    this.renderer = new BlackHoleRenderer(canvas, this.toShaderParams());
    if (!this.renderer.init()) {
      console.error("BlackHole: WebGL2 not available");
      new import_obsidian2.Notice("Black Hole plugin requires WebGL2");
      canvas.remove();
      this.renderer = null;
      this.canvas = null;
      return;
    }
    this.capture = new WorkspaceCapture();
    this.capture.setElement(this.findCaptureTarget());
    const blank = WorkspaceCapture.blankCanvas(window.innerWidth, window.innerHeight);
    this.renderer.updateTexture(blank);
    this.renderer.sizeMode = this.settings.sizeMode;
    this.renderer.lastActivity = performance.now() / 1e3;
    this.lastActivity = performance.now();
    this.renderer.start();
    document.addEventListener("keydown", this.activityHandler);
    document.addEventListener("mousedown", this.activityHandler);
    document.addEventListener("touchstart", this.activityHandler);
    document.addEventListener("wheel", this.activityHandler, { passive: true });
    this.captureIntervalId = window.setInterval(() => {
      if (!this.renderer || !this.capture)
        return;
      this.capture.capture(performance.now());
      const cap = this.capture.latestCanvas;
      if (cap) {
        this.renderer.updateTexture(cap);
      }
    }, 300);
    this.metricIntervalId = window.setInterval(() => {
      if (!this.renderer || this.settings.sizeMode !== 1)
        return;
      this.renderer.tokenLevel = this.computeTokenLevel();
    }, 500);
    this.domObserver = new MutationObserver(() => {
      if (this.capture)
        this.capture.setElement(this.findCaptureTarget());
    });
    this.domObserver.observe(document.body, { childList: true, subtree: true });
  }
  stop() {
    if (this.renderer) {
      this.renderer.destroy();
      this.renderer = null;
    }
    this.capture = null;
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
    }
    window.clearInterval(this.captureIntervalId);
    window.clearInterval(this.metricIntervalId);
    this.captureIntervalId = 0;
    this.metricIntervalId = 0;
    document.removeEventListener("keydown", this.activityHandler);
    document.removeEventListener("mousedown", this.activityHandler);
    document.removeEventListener("touchstart", this.activityHandler);
    document.removeEventListener("wheel", this.activityHandler);
    this.domObserver?.disconnect();
    this.domObserver = null;
  }
  onModeChange() {
    if (!this.renderer)
      return;
    this.renderer.sizeMode = this.settings.sizeMode;
    this.renderer.recompile(this.toShaderParams());
    this.capture?.reset();
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async loadSettings() {
    const data = await this.loadData();
    if (data)
      this.settings = { ...DEFAULT_SETTINGS, ...data };
  }
  toShaderParams() {
    return {
      holeRadius: this.settings.holeRadius,
      lensDepth: this.settings.lensDepth,
      starGain: this.settings.starGain,
      diskInner: this.settings.diskInner,
      diskOuter: this.settings.diskOuter,
      diskIncl: this.settings.diskIncl,
      diskRoll: this.settings.diskRoll,
      diskGain: this.settings.diskGain,
      diskOpacity: this.settings.diskOpacity,
      diskTemp: this.settings.diskTemp,
      dopplerMix: this.settings.dopplerMix,
      diskBeam: this.settings.diskBeam,
      diskSpeed: this.settings.diskSpeed,
      diskWind: this.settings.diskWind,
      diskContrast: this.settings.diskContrast,
      exposure: this.settings.exposure,
      driftSpeed: this.settings.driftSpeed,
      workArea: this.settings.workArea,
      dilationMin: this.settings.dilationMin,
      tokenAreaMin: this.settings.tokenAreaMin,
      tokenAreaMax: this.settings.tokenAreaMax,
      tokenHomeX: this.settings.tokenHomeX,
      tokenHomeY: this.settings.tokenHomeY,
      tokenEase: this.settings.tokenEase,
      tokenReach: this.settings.tokenReach,
      tokenCalm: this.settings.tokenCalm,
      tokenRush: this.settings.tokenRush,
      nSteps: this.settings.nSteps,
      workPeriodMin: this.settings.workPeriodMin,
      breakMin: this.settings.breakMin,
      idleFadeSec: this.settings.idleFadeSec,
      tokenGlideMin: 0.3,
      tokenGlideMax: 1.5,
      tokenGlideRate: 10
    };
  }
  computeTokenLevel() {
    if (this.settings.sizeMode !== 1)
      return -1;
    switch (this.settings.tokenMetric) {
      case "word-count": {
        const mdView = this.app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView);
        if (!mdView)
          return -1;
        const text = mdView.editor?.getValue() ?? "";
        const words = text.split(/\s+/).filter((w) => w.length > 0).length;
        return Math.min(words / this.settings.maxWordCount, 1);
      }
      case "global-word-count": {
        const files = this.app.vault.getMarkdownFiles();
        return Math.min(files.length * 500 / this.settings.maxWordCount, 1);
      }
      case "file-count": {
        const files = this.app.vault.getMarkdownFiles();
        return Math.min(files.length / 1e3, 1);
      }
      case "tab-count": {
        const leaves = this.app.workspace.getLeavesOfType("markdown");
        return Math.min(leaves.length / 20, 1);
      }
      default:
        return -1;
    }
  }
  findCaptureTarget() {
    const activeLeaf = this.app.workspace.activeLeaf;
    if (activeLeaf) {
      const container = activeLeaf.containerEl;
      if (container) {
        const vc = container.querySelector(".view-content");
        return vc ?? container;
      }
    }
    return document.querySelector(".view-content") ?? null;
  }
};
/*! Bundled license information:

dom-to-image-more/dist/dom-to-image-more.min.js:
  (*! dom-to-image-more v3.10.0 2026-06-12 05:29:50 UTC *)
*/
