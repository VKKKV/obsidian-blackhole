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
        }, canvasToBlob: function(t4) {
          if (t4.toBlob)
            return new Promise(function(e3) {
              t4.toBlob(e3);
            });
          return ((o3) => new Promise(function(e3) {
            var t5 = b(o3.toDataURL().split(",")[1]), n3 = t5.length, r3 = new Uint8Array(n3);
            for (let e4 = 0; e4 < n3; e4++)
              r3[e4] = t5.charCodeAt(e4);
            e3(new Blob([r3], { type: "image/png" }));
          }))(t4);
        }, resolveUrl: function(e3, t4) {
          var n3 = document.implementation.createHTMLDocument(), r3 = n3.createElement("base"), o3 = (n3.head.appendChild(r3), n3.createElement("a"));
          return Object.assign(o3.style, h), n3.body.appendChild(o3), r3.href = t4, o3.href = e3, o3.href;
        }, getAndEncode: function(e3, t4) {
          return c2(e3, t4, true).then(s2);
        }, getResourceText: function(e3, t4, n3) {
          return c2(e3, t4, n3).then(u2);
        }, uid: function() {
          return "u" + ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4) + e2++;
        }, asArray: function(e3) {
          return Array.from(e3);
        }, escapeXhtml: function(e3) {
          return e3.replace(/%/g, "%25").replace(/#/g, "%23").replace(/\n/g, "%0A");
        }, makeImage: function(i3) {
          return "data:," !== i3 ? new Promise(function(t4, n3) {
            let r3 = document.createElementNS("http://www.w3.org/2000/svg", "svg"), o3 = new Image();
            v.impl.options.useCredentials && (o3.crossOrigin = "use-credentials"), o3.onload = function() {
              function e3() {
                window && window.requestAnimationFrame ? window.requestAnimationFrame(function() {
                  t4(o3);
                }) : t4(o3);
              }
              r3.remove(), "function" == typeof o3.decode ? o3.decode().then(e3, e3) : e3();
            }, o3.onerror = (e3) => {
              r3.remove();
              var t5 = String(i3).split(",", 1)[0], t5 = new Error("dom-to-image-more: failed to rasterize the generated image (" + t5 + ", " + String(i3).length + " bytes). The source may contain malformed markup, an unsupported element, or a tainted/cross-origin resource.");
              t5.cause = e3, n3(t5);
            }, r3.appendChild(o3), Object.assign(r3.style, h), o3.src = i3, document.body.appendChild(r3);
          }) : Promise.resolve();
        }, width: function(e3) {
          var t4 = m2(e3, "width");
          if (!isNaN(t4))
            return t4;
          t4 = f2(e3);
          if (t4)
            return t4.width;
          var t4 = m2(e3, "border-left-width"), n3 = m2(e3, "border-right-width");
          return e3.scrollWidth + t4 + n3;
        }, height: function(e3) {
          var t4 = m2(e3, "height");
          if (!isNaN(t4))
            return t4;
          t4 = f2(e3);
          if (t4)
            return t4.height;
          var t4 = m2(e3, "border-top-width"), n3 = m2(e3, "border-bottom-width");
          return e3.scrollHeight + t4 + n3;
        }, getWindow: r2, isElement: l2, isElementHostForOpenShadowRoot: function(e3) {
          return l2(e3) && null !== e3.shadowRoot;
        }, isShadowRoot: n2, isInShadowRoot: i2, isHTMLElement: function(e3) {
          return t3(e3, "HTMLElement");
        }, isHTMLCanvasElement: function(e3) {
          return t3(e3, "HTMLCanvasElement");
        }, isHTMLInputElement: function(e3) {
          return t3(e3, "HTMLInputElement");
        }, isHTMLImageElement: function(e3) {
          return t3(e3, "HTMLImageElement");
        }, isHTMLLinkElement: function(e3) {
          return t3(e3, "HTMLLinkElement");
        }, isHTMLScriptElement: function(e3) {
          return t3(e3, "HTMLScriptElement");
        }, isHTMLStyleElement: function(e3) {
          return t3(e3, "HTMLStyleElement");
        }, isHTMLTextAreaElement: function(e3) {
          return t3(e3, "HTMLTextAreaElement");
        }, isShadowSlotElement: function(e3) {
          return i2(e3) && t3(e3, "HTMLSlotElement");
        }, isSVGElement: function(e3) {
          return t3(e3, "SVGElement");
        }, isSVGImageElement: function(e3) {
          return t3(e3, "SVGImageElement");
        }, isSVGSVGElement: function(e3) {
          return t3(e3, "SVGSVGElement");
        }, isSVGRectElement: function(e3) {
          return t3(e3, "SVGRectElement");
        }, isSVGUseElement: function(e3) {
          return t3(e3, "SVGUseElement");
        }, isDimensionMissing: function(e3) {
          return isNaN(e3) || e3 <= 0;
        }, isInstanceOf: t3 };
        function r2(e3) {
          e3 = e3 ? e3.ownerDocument : void 0;
          return (e3 ? e3.defaultView : void 0) || ("undefined" != typeof window ? window : void 0) || (void 0 !== d ? d : void 0) || globalThis;
        }
        function t3(e3, t4) {
          var n3 = r2(e3);
          return o2(e3, n3, t4) || o2(e3, n3 && n3.parent, t4);
        }
        function o2(e3, t4, n3) {
          try {
            var r3 = t4 && t4[n3];
            return "function" == typeof r3 && e3 instanceof r3;
          } catch (e4) {
            return false;
          }
        }
        function n2(e3) {
          return t3(e3, "ShadowRoot");
        }
        function i2(e3) {
          return null != e3 && void 0 !== e3.getRootNode && n2(e3.getRootNode());
        }
        function l2(e3) {
          return t3(e3, "Element");
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
            let t4 = b(e3), n3 = "";
            for (let e4 = 0; e4 < t4.length; e4 += 1)
              n3 += "%" + ("00" + t4.charCodeAt(e4).toString(16)).slice(-2);
            return decodeURIComponent(n3);
          }
        }
        function a2(n3, r3, o3) {
          return new Promise(function(t4) {
            let e3 = new FileReader();
            e3.onloadend = function() {
              t4(e3.result);
            }, e3.onerror = function() {
              t4(o3);
            };
            try {
              e3[r3](n3);
            } catch (e4) {
              t4(o3);
            }
          });
        }
        function c2(a3, c3, e3) {
          let t4 = v.impl.urlCache.find(function(e4) {
            return e4.url === a3;
          });
          if (t4 || (t4 = { url: a3, promise: null }, v.impl.urlCache.push(t4)), null === t4.promise) {
            let s3 = function(e4) {
              var t5 = v.impl.options.requestInterceptor;
              if ("function" == typeof t5)
                try {
                  return t5(a3, { type: c3, status: e4 });
                } catch (e5) {
                  S("requestInterceptor threw:", e5);
                }
            }, u3 = function(e4) {
              return null != e4;
            };
            var n3 = s3(void 0);
            if (u3(n3))
              return t4.promise = Promise.resolve(n3), t4.promise;
            if (false === e3)
              return t4.promise = Promise.resolve(null), t4.promise;
            v.impl.options.cacheBust && (a3 += (/\?/.test(a3) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime()), t4.promise = new Promise(function(n4) {
              let o3 = new XMLHttpRequest();
              function i3(e5) {
                l3(e5, false), n4(null);
              }
              function t5() {
                r3("Status:" + o3.status + " while fetching resource: " + a3);
              }
              function r3(t6) {
                var e5 = s3(o3.status);
                u3(e5) ? Promise.resolve(e5).then(function(e6) {
                  l3(t6, true), n4(e6);
                }, function() {
                  S(t6), i3(t6);
                }) : (e5 = c3 === y.IMAGE || c3 === y.CSS_IMAGE ? v.impl.options.imagePlaceholder : void 0) ? (l3(t6, true), n4(e5)) : (S(t6), i3(t6));
              }
              function l3(e5, t6) {
                var n5 = v.impl.options.onImageError;
                if ("function" == typeof n5)
                  try {
                    n5({ url: a3, message: e5, status: o3.status, willUsePlaceholder: t6 });
                  } catch (e6) {
                    S("onImageError handler threw:", e6);
                  }
              }
              if (o3.timeout = v.impl.options.httpTimeout, o3.onerror = t5, o3.ontimeout = t5, o3.onloadend = function() {
                var e5;
                o3.readyState === XMLHttpRequest.DONE && (0 === (e5 = o3.status) && a3.toLowerCase().startsWith("file://") || 200 <= e5 && e5 <= 300 && null !== o3.response ? (e5 = o3.response) instanceof Blob ? n4(e5) : r3("Response was not a Blob (got " + typeof e5 + ") while fetching resource: " + a3) : t5());
              }, 0 < v.impl.options.useCredentialsFilters.length && (v.impl.options.useCredentials = 0 < v.impl.options.useCredentialsFilters.filter((e5) => 0 <= a3.search(e5)).length), v.impl.options.useCredentials && (o3.withCredentials = true), v.impl.options.corsImg && 0 === a3.indexOf("http") && -1 === a3.indexOf(window.location.origin)) {
                var e4 = "POST" === (v.impl.options.corsImg.method || "GET").toUpperCase() ? "POST" : "GET";
                o3.open(e4, (v.impl.options.corsImg.url || "").replace("#{cors}", a3), true);
                let t6 = false, n5 = v.impl.options.corsImg.headers || {}, r4 = (Object.keys(n5).forEach(function(e5) {
                  -1 !== n5[e5].indexOf("application/json") && (t6 = true), o3.setRequestHeader(e5, n5[e5]);
                }), ((e5) => {
                  try {
                    return JSON.parse(JSON.stringify(e5));
                  } catch (e6) {
                    S("corsImg.data is missing or invalid", e6), i3("corsImg.data is missing or invalid");
                  }
                })(v.impl.options.corsImg.data || ""));
                Object.keys(r4).forEach(function(e5) {
                  "string" == typeof r4[e5] && (r4[e5] = r4[e5].replace("#{cors}", a3));
                }), o3.responseType = "blob", o3.send(t6 ? JSON.stringify(r4) : r4);
              } else
                o3.open("GET", a3, true), o3.responseType = "blob", o3.send();
            });
          }
          return t4.promise;
        }
        function f2(e3) {
          if (e3.nodeType !== w || "function" != typeof e3.getBBox)
            return null;
          try {
            var t4 = e3.getBBox();
            return t4 && (t4.width || t4.height) ? t4 : null;
          } catch (e4) {
            return null;
          }
        }
        function m2(t4, n3) {
          if (t4.nodeType === w) {
            let e3 = E(t4).getPropertyValue(n3);
            if ("px" === e3.slice(-2))
              return e3 = e3.slice(0, -2), parseFloat(e3);
          }
          return NaN;
        }
      })(), g = /* @__PURE__ */ (() => {
        let r2 = /url\(\s*(["']?)((?:\\.|[^\\)])+)\1\s*\)/gm;
        return { inlineAll: function(t3, r3, o2, i2) {
          if (!e2(t3))
            return Promise.resolve(t3);
          return Promise.resolve(t3).then(n2).then(function(e3) {
            return v.impl.options.filterUrls ? e3.filter(function(e4) {
              return v.impl.options.filterUrls(e4, r3);
            }) : e3;
          }).then(function(e3) {
            let n3 = Promise.resolve(t3);
            return e3.forEach(function(t4) {
              n3 = n3.then(function(e4) {
                return s2(e4, t4, r3, o2, i2);
              });
            }), n3;
          });
        }, shouldProcess: e2, impl: { readUrls: n2, inline: s2, urlAsRegex: l2 } };
        function e2(e3) {
          return -1 !== e3.search(r2);
        }
        function n2(e3) {
          for (var t3, n3 = []; null !== (t3 = r2.exec(e3)); )
            n3.push(t3[2]);
          return n3.filter(function(e4) {
            return !p.isDataUrl(e4);
          });
        }
        function l2(e3) {
          return new RegExp(`url\\((["']?)(${p.escape(e3)})\\1\\)`, "gm");
        }
        function s2(n3, r3, t3, o2, i2) {
          return Promise.resolve(r3).then(function(e3) {
            return t3 ? p.resolveUrl(e3, t3) : e3;
          }).then(function(e3) {
            return (i2 || p.getAndEncode)(e3, o2);
          }).then(function(e3) {
            var t4 = l2(r3);
            return n3.replace(t4, `url($1${e3}$1)`);
          });
        }
      })(), e = { resolveAll: function() {
        return t2().then(function(e2) {
          return Promise.all(e2.map(function(e3) {
            return e3.resolve();
          }));
        }).then(function(e2) {
          return e2.join("\n");
        });
      }, impl: { readAll: t2 } };
      function t2() {
        return Promise.resolve(p.asArray(document.styleSheets)).then(function(e2) {
          let r2 = "function" == typeof v.impl.options.requestInterceptor, o2 = {};
          return Promise.all(e2.map(function(t4) {
            let n2 = t4.href;
            if (!n2 || o2[n2])
              return t4;
            o2[n2] = true;
            var e3 = ((e4) => {
              try {
                return !e4.cssRules;
              } catch (e5) {
                return true;
              }
            })(t4) && ((e4) => {
              var t5 = v.impl.options.loadExternalStyleSheet;
              if ("function" == typeof t5)
                try {
                  return true === t5(e4);
                } catch (e5) {
                  return S("domtoimage: loadExternalStyleSheet predicate threw:", e5), false;
                }
              return true === t5;
            })(n2);
            return r2 || e3 ? p.getResourceText(n2, y.STYLESHEET, e3).then(function(e4) {
              return e4 && ((e5, t5) => {
                try {
                  var n3 = document.implementation.createHTMLDocument(""), r3 = n3.createElement("style");
                  return r3.appendChild(document.createTextNode(((e6, r4) => e6.replace(/url\((['"]?)([^'")]+)\1\)/g, function(e7, t6, n4) {
                    n4 = n4.trim();
                    return p.isDataUrl(n4) || /^[a-z][a-z0-9+.-]*:/i.test(n4) ? e7 : `url(${t6}${p.resolveUrl(n4, r4)}${t6})`;
                  }))(e5, t5))), n3.body.appendChild(r3), r3.sheet;
                } catch (e6) {
                  return null;
                }
              })(e4, n2) || t4;
            }) : t4;
          }));
        }).then(function(e2) {
          let n2 = [];
          return e2.forEach(function(t4) {
            var e3 = Object.getPrototypeOf(t4);
            if (Object.prototype.hasOwnProperty.call(e3, "cssRules"))
              try {
                p.asArray(t4.cssRules || []).forEach(n2.push.bind(n2));
              } catch (e4) {
                v.impl.options.ignoreCSSRuleErrors || S("domtoimage: Error while reading CSS rules from: " + t4.href, e4);
              }
          }), n2;
        }).then(function(e2) {
          return e2.filter(function(e3) {
            return e3.type === CSSRule.FONT_FACE_RULE;
          }).filter(function(e3) {
            return g.shouldProcess(e3.style.getPropertyValue("src"));
          });
        }).then(function(e2) {
          return e2.map(t3);
        });
        function t3(t4) {
          return { resolve: function() {
            var e2 = (t4.parentStyleSheet || {}).href;
            return g.inlineAll(t4.cssText, e2, y.FONT);
          }, src: function() {
            return t4.style.getPropertyValue("src");
          } };
        }
      }
      let n = { inlineAll: function t3(e2) {
        if (!p.isElement(e2))
          return Promise.resolve(e2);
        return n2(e2).then(function() {
          return p.isHTMLImageElement(e2) ? r(e2).inline() : p.isSVGImageElement(e2) ? o(e2) : Promise.all(p.asArray(e2.childNodes).map(function(e3) {
            return t3(e3);
          }));
        });
        function n2(r2) {
          if (!r2.style)
            return Promise.resolve(r2);
          let e3 = ["background", "background-image", "mask", "mask-image", "-webkit-mask", "-webkit-mask-image"], t4 = e3.map(function(t5) {
            let e4 = r2.style.getPropertyValue(t5), n3 = r2.style.getPropertyPriority(t5);
            return e4 ? g.inlineAll(e4, void 0, y.CSS_IMAGE).then(function(e5) {
              r2.style.setProperty(t5, e5, n3);
            }) : Promise.resolve();
          });
          return Promise.all(t4).then(function() {
            return r2;
          });
        }
      }, impl: { newImage: r } };
      function r(n2) {
        return { inline: function(t3) {
          if (p.isDataUrl(n2.src))
            return Promise.resolve();
          return Promise.resolve(n2.src).then(function(e2) {
            return (t3 || p.getAndEncode)(e2, y.IMAGE);
          }).then(function(t4) {
            return new Promise(function(e2) {
              n2.onload = e2, n2.onerror = e2, n2.src = t4;
            });
          });
        } };
      }
      function o(t3, n2) {
        let r2 = "http://www.w3.org/1999/xlink";
        var e2 = t3.getAttribute("href") || t3.getAttributeNS(r2, "href") || t3.getAttribute("xlink:href");
        return !e2 || p.isDataUrl(e2) ? Promise.resolve(t3) : Promise.resolve(e2).then(function(e3) {
          return (n2 || p.getAndEncode)(e3, y.IMAGE);
        }).then(function(e3) {
          return e3 && (t3.setAttributeNS(r2, "xlink:href", e3), t3.setAttribute("href", e3)), t3;
        });
      }
      let h = { position: "fixed", left: "-9999px", visibility: "hidden" }, i = { warn: function(...e2) {
        console.warn(...e2);
      }, error: function(...e2) {
        console.error(...e2);
      } }, l = { copyDefaultStyles: true, imagePlaceholder: void 0, cacheBust: false, useCredentials: false, useCredentialsFilters: [], httpTimeout: 3e4, styleCaching: "strict", corsImg: void 0, adjustClonedNode: void 0, filterStyles: void 0, filterUrls: void 0, adjustPseudoElement: void 0, onImageError: void 0, ensureShown: false, pixelRatio: 1, preserveScroll: false, ignoreCSSRuleErrors: false, requestInterceptor: void 0, loadExternalStyleSheet: false, logger: i }, y = Object.freeze({ IMAGE: "image", CSS_IMAGE: "css-image", FONT: "font", STYLESHEET: "stylesheet" }), v = { toSvg: a, toPng: function(e2, t3) {
        return c(e2, t3).then(function(e3) {
          return e3.toDataURL();
        });
      }, toJpeg: function(e2, t3) {
        return c(e2, t3).then(function(e3) {
          return e3.toDataURL("image/jpeg", (t3 ? t3.quality : void 0) || 1);
        });
      }, toBlob: function(e2, t3) {
        return c(e2, t3).then(p.canvasToBlob);
      }, toPixelData: function(t3, e2) {
        return c(t3, e2).then(function(e3) {
          return e3.getContext("2d").getImageData(0, 0, p.width(t3), p.height(t3)).data;
        });
      }, toCanvas: c, ResourceType: y, impl: { fontFaces: e, images: n, util: p, inliner: g, urlCache: [], options: {}, copyOptions: function(t3) {
        Object.keys(l).forEach(function(e2) {
          v.impl.options[e2] = (void 0 === t3[e2] ? l : t3)[e2];
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
      function u(e2, t3) {
        var n2 = v.impl.options.logger || i, e2 = n2[e2];
        "function" == typeof e2 && e2.apply(n2, t3);
      }
      function a(s2, u2) {
        let i2 = v.impl.util.getWindow(s2), o2 = (u2 = u2 || {}, v.impl.copyOptions(u2), []);
        return T = [], i2 && i2.document ? (() => {
          var e2 = i2.document;
          if (!e2.fonts || !e2.fonts.ready)
            return Promise.resolve();
          let t3 = v.impl.options.httpTimeout || 3e4, n2, r2 = Promise.resolve(e2.fonts.ready).then(function() {
            return false;
          }, function() {
            return false;
          }), o3 = new Promise(function(e3) {
            n2 = i2.setTimeout(function() {
              e3(true);
            }, t3);
          });
          return Promise.race([r2, o3]).then(function(e3) {
            i2.clearTimeout(n2), e3 && m("dom-to-image-more: timed out after " + t3 + "ms waiting for document fonts to finish loading (document.fonts.ready); rendering anyway \u2014 the output may have missing glyphs or fallback-font metrics.");
          });
        })().then(function() {
          var e2 = s2;
          if (e2.nodeType === w)
            return e2;
          var t3, n2 = e2, r2 = e2.parentNode;
          if (r2)
            return t3 = document.createElement("span"), r2.replaceChild(t3, n2), t3.append(e2), o2.push({ parent: r2, child: n2, wrapper: t3 }), t3;
          throw new Error("Cannot render a non-element node that is not attached to a parent; wrap it in an element or attach it to the document first.");
        }).then(function(e2) {
          return function l2(t3, d2, h2, s3) {
            let e3 = d2.filter;
            if (t3 === P || p.isHTMLScriptElement(t3) || p.isHTMLStyleElement(t3) || p.isHTMLLinkElement(t3) || null !== h2 && e3 && !e3(t3))
              return Promise.resolve();
            return Promise.resolve(t3).then(n2).then(r2).then(function(e4) {
              return u3(e4, i3(t3));
            }).then(o3).then(function(e4) {
              return a3(e4, t3);
            });
            function n2(e4) {
              return p.isHTMLCanvasElement(e4) ? p.makeImage(e4.toDataURL()) : e4.cloneNode(false);
            }
            function r2(e4) {
              return d2.adjustClonedNode && d2.adjustClonedNode(t3, e4, false), Promise.resolve(e4);
            }
            function o3(e4) {
              return d2.adjustClonedNode && d2.adjustClonedNode(t3, e4, true), Promise.resolve(e4);
            }
            function i3(e4) {
              return p.isElementHostForOpenShadowRoot(e4) ? e4.shadowRoot : e4;
            }
            function u3(n3, e4) {
              let r3 = t4(e4), o4 = Promise.resolve();
              if (0 !== r3.length) {
                let t5 = E(i4(e4));
                p.asArray(r3).forEach(function(e5) {
                  o4 = o4.then(function() {
                    return l2(e5, d2, t5, s3).then(function(e6) {
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
              function t4(t5) {
                if (p.isShadowSlotElement(t5)) {
                  let e5 = t5.assignedNodes();
                  if (e5 && 0 < e5.length)
                    return e5;
                }
                return t5.childNodes;
              }
            }
            function a3(a4, c3) {
              return !p.isElement(a4) || p.isShadowSlotElement(c3) ? Promise.resolve(a4) : Promise.resolve().then(n3).then(o4).then(i4).then(l3).then(t4).then(e4).then(s4).then(u4).then(r3).then(function() {
                return a4;
              });
              function e4() {
                if (d2.preserveScroll && a4.style) {
                  let e5 = c3.scrollLeft || 0, t5 = c3.scrollTop || 0;
                  if (0 !== e5 || 0 !== t5) {
                    a4.style.overflow = "hidden";
                    let n4 = `translate(${-e5}px, ${-t5}px)`;
                    p.asArray(a4.children).forEach(function(t6) {
                      if (t6.style) {
                        let e6 = t6.style.transform && "none" !== t6.style.transform ? " " + t6.style.transform : "";
                        t6.style.transform = n4 + e6;
                      }
                    });
                  }
                }
              }
              function t4() {
                if (a4.attributes && a4.removeAttribute) {
                  let n4 = [];
                  for (let t5 = 0; t5 < a4.attributes.length; t5 += 1) {
                    let e5 = a4.attributes[t5].name;
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
                  let t6 = E(c3).getPropertyValue("visibility");
                  if (null === h2)
                    "visible" !== t6 && a4.style.setProperty("visibility", "visible");
                  else {
                    let e6 = h2.getPropertyValue("visibility");
                    t6 === e6 && a4.style.removeProperty("visibility");
                  }
                }
                function r4(e6, t6) {
                  t6.font = e6.font, t6.fontFamily = e6.fontFamily, t6.fontFeatureSettings = e6.fontFeatureSettings, t6.fontKerning = e6.fontKerning, t6.fontSize = e6.fontSize, t6.fontStretch = e6.fontStretch, t6.fontStyle = e6.fontStyle, t6.fontVariant = e6.fontVariant, t6.fontVariantCaps = e6.fontVariantCaps, t6.fontVariantEastAsian = e6.fontVariantEastAsian, t6.fontVariantLigatures = e6.fontVariantLigatures, t6.fontVariantNumeric = e6.fontVariantNumeric, t6.fontVariationSettings = e6.fontVariationSettings, t6.fontWeight = e6.fontWeight;
                }
                function t5(e6, t6) {
                  let n4 = E(e6);
                  n4.cssText ? (t6.style.cssText = n4.cssText, r4(n4, t6.style)) : (I(d2, e6, n4, h2, t6), null === h2 && (["inset-block", "inset-block-start", "inset-block-end"].forEach((e7) => t6.style.removeProperty(e7)), ["left", "right", "top", "bottom"].forEach((e7) => {
                    t6.style.getPropertyValue(e7) && t6.style.setProperty(e7, "0px");
                  })));
                }
                a4.style && (t5(c3, a4), e5());
              }
              function i4() {
                let u5 = p.uid();
                return Promise.all([":before", ":after"].map(e5));
                function e5(o5) {
                  let i5 = E(c3, o5), l4 = i5.getPropertyValue("content");
                  if ("" !== l4 && "none" !== l4) {
                    let s6 = function() {
                      let e7 = p.asArray(i5).map(t6).join("; ");
                      return e7 + ";";
                      function t6(e8) {
                        let t7 = i5.getPropertyValue(e8), n5 = i5.getPropertyPriority(e8) ? " !important" : "";
                        return e8 + ": " + t7 + n5;
                      }
                    };
                    var s5 = s6;
                    let t5;
                    if (d2.adjustPseudoElement) {
                      let e7 = d2.adjustPseudoElement(c3, o5, i5);
                      if (false === e7)
                        return;
                      e7 && "object" == typeof e7 && (t5 = e7);
                    }
                    let e6 = a4.getAttribute("class") || "", n4 = (a4.setAttribute("class", e6 + " " + u5), `.${u5}:` + o5), r4 = i5.cssText ? `${i5.cssText} content: ${l4};` : s6();
                    return t5 && (r4 += Object.keys(t5).map(function(e7) {
                      return ` ${e7}: ${t5[e7]};`;
                    }).join("")), g.inlineAll(r4, void 0, y.CSS_IMAGE).then(function(e7) {
                      let t6 = document.createElement("style");
                      t6.appendChild(document.createTextNode(n4 + `{${e7}}`)), a4.appendChild(t6);
                    });
                  }
                }
              }
              function l3() {
                p.isHTMLTextAreaElement(c3) && (a4.innerHTML = c3.value), p.isHTMLInputElement(c3) && a4.setAttribute("value", c3.value);
              }
              function s4() {
                p.isSVGElement(a4) && (a4.setAttribute("xmlns", "http://www.w3.org/2000/svg"), p.isSVGRectElement(a4) && ["width", "height"].forEach(function(e5) {
                  let t5 = a4.getAttribute(e5);
                  t5 && a4.style.setProperty(e5, t5);
                }), p.isSVGUseElement(a4)) && m2(c3);
              }
              function u4() {
                if (p.isElement(a4) && f2()) {
                  let e5 = E(c3).getPropertyValue("display");
                  "table" !== e5 && "inline-table" !== e5 || (a4.style.removeProperty("height"), a4.style.removeProperty("block-size"));
                }
              }
              function f2() {
                let t5 = c3.children || [];
                for (let e5 = 0; e5 < t5.length; e5 += 1)
                  if ("CAPTION" === t5[e5].tagName)
                    return true;
                return false;
              }
              function m2(e5) {
                let t5 = e5.getAttribute("href") || e5.getAttributeNS("http://www.w3.org/1999/xlink", "href") || e5.getAttribute("xlink:href");
                if (t5 && "#" === t5.charAt(0)) {
                  let n4 = t5.slice(1);
                  if (!T.some((e6) => e6.id === n4)) {
                    let t6 = e5.ownerDocument.getElementById(n4);
                    if (t6) {
                      let e6 = t6.cloneNode(true);
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
            let t3 = document.createElementNS(o3, "defs"), n2 = (i3.appendChild(t3), /* @__PURE__ */ new Set()), r2 = (e2.getAttribute("id") && n2.add(e2.getAttribute("id")), e2.querySelectorAll("[id]").forEach(function(e3) {
              n2.add(e3.getAttribute("id"));
            }), 0);
            T.forEach(function(e3) {
              n2.has(e3.id) || (t3.appendChild(e3.node), r2 += 1);
            }), 0 < r2 && e2.insertBefore(i3, e2.firstChild);
          }
          return e2;
        }).then(u2.disableEmbedFonts ? Promise.resolve(s2) : A).then(u2.disableInlineImages ? Promise.resolve(s2) : C).then(function(e2) {
          e2.style && (e2.style.margin = "0");
          u2.bgcolor && (e2.style.backgroundColor = u2.bgcolor);
          u2.width && (e2.style.width = u2.width + "px");
          u2.height && (e2.style.height = u2.height + "px");
          u2.style && Object.assign(e2.style, u2.style);
          let t3 = null;
          "function" == typeof u2.onclone && (t3 = u2.onclone(e2));
          return Promise.resolve(t3).then(function() {
            return e2;
          });
        }).then(function(e2) {
          if (p.isSVGElement(s2) && !p.isSVGSVGElement(s2))
            return ((e3) => {
              let r3 = "http://www.w3.org/2000/svg", t4 = c2(e3), o3;
              try {
                o3 = s2.getBBox();
              } catch (e4) {
                o3 = { x: 0, y: 0, width: 0, height: 0 };
              } finally {
                t4();
              }
              e3.removeAttribute("transform"), e3.style.removeProperty("transform");
              let i3 = u2.width || o3.width, l2 = u2.height || o3.height;
              return Promise.resolve(e3).then(function(e4) {
                return e4.setAttribute("xmlns", r3), new XMLSerializer().serializeToString(e4);
              }).then(a2).then(p.escapeXhtml).then(function(e4) {
                var t5 = (p.isDimensionMissing(i3) ? "" : ` width="${i3}"`) + (p.isDimensionMissing(l2) ? "" : ` height="${l2}"`), n3 = `${o3.x} ${o3.y} ${o3.width} ` + o3.height;
                return `<svg xmlns="${r3}"${t5} viewBox="${n3}">${e4}</svg>`;
              }).then(function(e4) {
                return "data:image/svg+xml;charset=utf-8," + e4;
              });
            })(e2);
          let t3 = c2(e2), n2, r2;
          try {
            n2 = u2.width || p.width(s2), r2 = u2.height || p.height(s2);
          } finally {
            t3();
          }
          return Promise.resolve(e2).then(function(e3) {
            return e3.setAttribute("xmlns", "http://www.w3.org/1999/xhtml"), new XMLSerializer().serializeToString(e3);
          }).then(a2).then(p.escapeXhtml).then(function(e3) {
            var t4 = (p.isDimensionMissing(n2) ? ' width="100%"' : ` width="${n2}"`) + (p.isDimensionMissing(r2) ? ' height="100%"' : ` height="${r2}"`);
            return `<svg xmlns="http://www.w3.org/2000/svg"${(p.isDimensionMissing(n2) ? "" : ` width="${n2}"`) + (p.isDimensionMissing(r2) ? "" : ` height="${r2}"`)}><foreignObject${t4}>${e3}</foreignObject></svg>`;
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
          return e2.replace(/url\(&quot;([^]*?)&quot;\)/g, function(e3, t3) {
            return 0 <= t3.indexOf("'") ? e3 : `url('${t3}')`;
          });
        }
        function c2(t3) {
          function e2() {
          }
          if (!u2.ensureShown)
            return e2;
          var n2 = E(s2);
          if ("0" === n2.getPropertyValue("opacity") && t3.style.setProperty("opacity", "1"), "none" !== n2.getPropertyValue("display"))
            return e2;
          let r2 = s2.style.getPropertyValue("display"), o3 = s2.style.getPropertyPriority("display");
          return s2.style.removeProperty("display"), "none" === E(s2).getPropertyValue("display") && (n2 = r2 && "none" !== r2 ? r2 : "revert", s2.style.setProperty("display", n2, "important")), function() {
            var e3 = E(s2).getPropertyValue("display");
            t3.style.setProperty("display", "none" === e3 ? "block" : e3), r2 ? s2.style.setProperty("display", r2, o3) : s2.style.removeProperty("display");
          };
        }
      }
      function c(i2, l2) {
        return a(i2, l2 = l2 || {}).then(p.makeImage).then(function(e2) {
          var t3 = ((e3) => {
            let t4 = l2.width || p.width(e3), n3 = l2.height || p.height(e3);
            p.isDimensionMissing(t4) && (t4 = p.isDimensionMissing(n3) ? 300 : 2 * n3), p.isDimensionMissing(n3) && (n3 = t4 / 2);
            var r3, e3 = ("number" == typeof l2.scale ? l2.scale : 1) * ("number" == typeof l2.pixelRatio ? l2.pixelRatio : 1), e3 = ((e4, t5, n4) => {
              var r4 = 16384, o4 = 0 < e4 && 0 < t5 && 0 < n4;
              return !o4 || (o4 = Math.min(r4 / e4, r4 / t5, Math.sqrt(268435456 / (e4 * t5))), n4 <= o4) ? n4 : (m("dom-to-image-more: the requested " + Math.round(e4 * n4) + "\xD7" + Math.round(t5 * n4) + " canvas exceeds the browser limit; clamping the effective scale from " + n4 + " to " + o4 + ". Capture detail may be reduced \u2014 render a smaller region or lower scale/pixelRatio."), o4);
            })(t4, n3, e3), o3 = document.createElement("canvas");
            return o3.width = t4 * e3, o3.height = n3 * e3, l2.bgcolor && ((r3 = o3.getContext("2d")).fillStyle = l2.bgcolor, r3.fillRect(0, 0, o3.width, o3.height)), { canvas: o3, scale: e3, width: t4, height: n3 };
          })(i2), n2 = t3.canvas, r2 = t3.scale, o2 = n2.getContext("2d");
          return o2.msImageSmoothingEnabled = false, o2.imageSmoothingEnabled = false, e2 && (o2.scale(r2, r2), o2.drawImage(e2, 0, 0, t3.width, t3.height)), n2;
        });
      }
      let P = null, T = [];
      function A(n2) {
        return e.resolveAll().then(function(e2) {
          var t3;
          return "" !== e2 && (t3 = document.createElement("style"), n2.appendChild(t3), t3.appendChild(document.createTextNode(e2))), n2;
        });
      }
      function C(e2) {
        return n.inlineAll(e2).then(function() {
          return e2;
        });
      }
      function x(e2, t3, n2, r2) {
        var o2 = 0 <= ["background-clip"].indexOf(t3);
        r2 ? (e2.setProperty(t3, n2, r2), o2 && e2.setProperty("-webkit-" + t3, n2, r2)) : (e2.setProperty(t3, n2), o2 && e2.setProperty("-webkit-" + t3, n2));
      }
      let M = Symbol("dtim-ua-relative-font-size");
      function I(o2, i2, l2, s2, e2) {
        let u2 = v.impl.options.copyDefaultStyles ? ((t3, e3) => {
          var n2, r3 = ((e4) => {
            var t4 = [];
            do {
              if (e4.nodeType === w) {
                var n3 = e4.tagName;
                if (t4.push(n3), N.includes(n3))
                  break;
              }
            } while (e4 = e4.parentNode);
            return t4;
          })(e3), o3 = ((e4) => ("relaxed" !== t3.styleCaching ? e4 : e4.filter((e5, t4, n3) => 0 === t4 || t4 === n3.length - 1)).join(">"))(r3) + ((t4) => t4 && t4.hasAttribute ? O.filter(function(e4) {
            return t4.hasAttribute(e4);
          }).map(function(e4) {
            return `[${e4}]`;
          }).join("") : "")(e3);
          {
            if (V[o3])
              return V[o3];
            n2 = (() => {
              if (P)
                return P.contentWindow;
              t4 = document.characterSet || "UTF-8", e4 = (e4 = document.doctype) ? (`<!DOCTYPE ${s4(e4.name)} ${s4(e4.publicId)} ` + s4(e4.systemId)).trim() + ">" : "", (P = document.createElement("iframe")).id = "domtoimage-sandbox-" + p.uid(), Object.assign(P.style, h), document.body.appendChild(P);
              var e4, t4, n3 = P, r4 = "domtoimage-sandbox";
              try {
                return n3.contentWindow.document.write(e4 + `<html><head><meta charset='${t4}'><title>${r4}</title></head><body></body></html>`), n3.contentWindow;
              } catch (e5) {
              }
              var o4 = document.createElement("meta");
              o4.setAttribute("charset", t4);
              try {
                var i4 = document.implementation.createHTMLDocument(r4), l4 = (i4.head.appendChild(o4), e4 + i4.documentElement.outerHTML);
                return n3.setAttribute("srcdoc", l4), n3.contentWindow;
              } catch (e5) {
              }
              return n3.contentDocument.head.appendChild(o4), n3.contentDocument.title = r4, n3.contentWindow;
              function s4(e5) {
                var t5;
                return e5 ? ((t5 = document.createElement("div")).innerText = e5, t5.innerHTML) : "";
              }
            })();
            var i3 = r3 = ((e4, t4) => {
              let n3 = e4.body;
              do {
                var r4 = t4.pop(), r4 = e4.createElement(r4);
                n3.appendChild(r4), n3 = r4;
              } while (0 < t4.length);
              return n3.textContent = "\u200B", n3;
            })(n2.document, r3), l3 = e3, s3 = (l3 && l3.hasAttribute && O.forEach(function(e4) {
              l3.hasAttribute(e4) && i3.setAttribute(e4, l3.getAttribute(e4));
            }), e3 = ((e4, t4) => {
              let n3 = {}, r4 = e4.getComputedStyle(t4), o4 = (p.asArray(r4).forEach(function(e5) {
                n3[e5] = "width" === e5 || "height" === e5 ? "auto" : r4.getPropertyValue(e5);
              }), t4.parentElement);
              return o4 && (t4 = e4.getComputedStyle(o4).getPropertyValue("font-size"), n3[M] = n3["font-size"] !== t4), n3;
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
          var t3, n2, r3;
          o2.filterStyles && !o2.filterStyles(i2, e3) || (t3 = l2.getPropertyValue(e3), r3 = u2[e3], n2 = s2 ? s2.getPropertyValue(e3) : void 0, a2.getPropertyValue(e3)) || (t3 !== r3 || s2 && t3 !== n2 || "font-size" === e3 && u2[M]) && (r3 = l2.getPropertyPriority(e3), x(a2, e3, t3, r3));
        }), r2 = l2, c2 = a2, ["top", "right", "bottom", "left"].forEach(function(e3) {
          var t3, n2 = `border-${e3}-width`, e3 = r2.getPropertyValue(`border-${e3}-style`);
          e3 && "none" !== e3 && !c2.getPropertyValue(n2) && (e3 = r2.getPropertyValue(n2)) && (t3 = r2.getPropertyPriority(n2), x(c2, n2, e3, t3));
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
  language: "auto",
  sizeMode: 1,
  idlePlaybackEnabled: false,
  idlePlaybackDelaySec: 45,
  tokenMetric: "word-count",
  maxWordCount: 5e3,
  holeRadius: 0.014,
  lensDepth: 13,
  starGain: 0,
  diskInner: 1.8,
  diskOuter: 7,
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
  tokenAreaMin: 3e-3,
  tokenAreaMax: 0.02,
  tokenHomeX: 0.96,
  tokenHomeY: 0.04,
  tokenEase: 1,
  tokenReach: 1,
  tokenCalm: 0.04,
  tokenRush: 1.1,
  nSteps: 10,
  workPeriodMin: 55,
  breakMin: 5,
  idleFadeSec: 90,
  renderScale: 0.35,
  captureEnabled: false,
  captureIntervalMs: 2500
};
var BlackHoleSettingsTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    const t2 = this.plugin.t.bind(this.plugin);
    containerEl.empty();
    containerEl.createEl("h2", { text: t2("settings.title") });
    containerEl.createEl("h3", { text: t2("settings.general") });
    new import_obsidian.Setting(containerEl).setName(t2("settings.language.name")).setDesc(t2("settings.language.desc")).addDropdown((dd) => {
      dd.addOption("auto", t2("settings.language.auto"));
      dd.addOption("en", t2("settings.language.en"));
      dd.addOption("zh-CN", t2("settings.language.zh-CN"));
      dd.setValue(this.plugin.settings.language);
      dd.onChange(async (v) => {
        this.plugin.settings.language = v;
        await this.plugin.saveSettings();
        this.display();
      });
    });
    containerEl.createEl("h3", { text: t2("settings.playback") });
    new import_obsidian.Setting(containerEl).setName(t2("settings.idleOnly.name")).setDesc(t2("settings.idleOnly.desc")).addToggle((tg) => {
      tg.setValue(this.plugin.settings.idlePlaybackEnabled);
      tg.onChange(async (v) => {
        this.plugin.settings.idlePlaybackEnabled = v;
        await this.plugin.saveSettings();
        this.plugin.applyRuntimeSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t2("settings.idleDelay.name")).setDesc(t2("settings.idleDelay.desc")).addSlider((sl) => {
      sl.setLimits(5, 600, 5);
      sl.setValue(this.plugin.settings.idlePlaybackDelaySec);
      sl.setDynamicTooltip();
      sl.onChange(async (v) => {
        this.plugin.settings.idlePlaybackDelaySec = v;
        await this.plugin.saveSettings();
        this.plugin.applyRuntimeSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t2("settings.mode.name")).setDesc(t2("settings.mode.desc")).addDropdown((dd) => {
      dd.addOption("0", t2("settings.mode.pomodoro"));
      dd.addOption("1", t2("settings.mode.token"));
      dd.addOption("2", t2("settings.mode.demo"));
      dd.setValue(String(this.plugin.settings.sizeMode));
      dd.onChange(async (v) => {
        this.plugin.settings.sizeMode = parseInt(v);
        await this.plugin.saveSettings();
        this.plugin.onModeChange();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t2("settings.tokenMetric.name")).setDesc(t2("settings.tokenMetric.desc")).addDropdown((dd) => {
      dd.addOption("word-count", t2("settings.tokenMetric.word"));
      dd.addOption("global-word-count", t2("settings.tokenMetric.global"));
      dd.addOption("file-count", t2("settings.tokenMetric.file"));
      dd.addOption("tab-count", t2("settings.tokenMetric.tab"));
      dd.setValue(this.plugin.settings.tokenMetric);
      dd.onChange(async (v) => {
        this.plugin.settings.tokenMetric = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t2("settings.maxWordCount.name")).setDesc(t2("settings.maxWordCount.desc")).addSlider((sl) => {
      sl.setLimits(100, 5e4, 100);
      sl.setValue(this.plugin.settings.maxWordCount);
      sl.onChange(async (v) => {
        this.plugin.settings.maxWordCount = v;
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("h3", { text: t2("settings.section.pomodoro") });
    new import_obsidian.Setting(containerEl).setName(t2("settings.workPeriod.name")).addSlider((sl) => {
      sl.setLimits(10, 120, 1);
      sl.setValue(this.plugin.settings.workPeriodMin);
      sl.onChange(async (v) => {
        this.plugin.settings.workPeriodMin = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t2("settings.break.name")).addSlider((sl) => {
      sl.setLimits(1, 30, 1);
      sl.setValue(this.plugin.settings.breakMin);
      sl.onChange(async (v) => {
        this.plugin.settings.breakMin = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t2("settings.idleFade.name")).setDesc(t2("settings.idleFade.desc")).addSlider((sl) => {
      sl.setLimits(10, 600, 5);
      sl.setValue(this.plugin.settings.idleFadeSec);
      sl.onChange(async (v) => {
        this.plugin.settings.idleFadeSec = v;
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("h3", { text: t2("settings.section.hole") });
    this.slider(t2("settings.holeRadius.name"), this.plugin.settings.holeRadius, 1e-3, 0.014, 1e-3, (v) => {
      this.plugin.settings.holeRadius = v;
    });
    this.slider(t2("settings.lensDepth.name"), this.plugin.settings.lensDepth, 1, 50, 0.5, (v) => {
      this.plugin.settings.lensDepth = v;
    });
    this.slider(t2("settings.starGain.name"), this.plugin.settings.starGain, 0, 5, 0.1, (v) => {
      this.plugin.settings.starGain = v;
    });
    containerEl.createEl("h3", { text: t2("settings.section.disk") });
    this.slider(t2("settings.diskInner.name"), this.plugin.settings.diskInner, 1.6, 10, 0.1, (v) => {
      this.plugin.settings.diskInner = v;
    });
    this.slider(t2("settings.diskOuter.name"), this.plugin.settings.diskOuter, 3, 7, 0.5, (v) => {
      this.plugin.settings.diskOuter = v;
    });
    this.slider(t2("settings.diskIncl.name"), this.plugin.settings.diskIncl, 0, 3.14, 0.01, (v) => {
      this.plugin.settings.diskIncl = v;
    });
    this.slider(t2("settings.diskRoll.name"), this.plugin.settings.diskRoll, -3.14, 3.14, 0.01, (v) => {
      this.plugin.settings.diskRoll = v;
    });
    this.slider(t2("settings.diskGain.name"), this.plugin.settings.diskGain, 0, 10, 0.1, (v) => {
      this.plugin.settings.diskGain = v;
    });
    this.slider(t2("settings.diskOpacity.name"), this.plugin.settings.diskOpacity, 0, 1, 0.01, (v) => {
      this.plugin.settings.diskOpacity = v;
    });
    this.slider(t2("settings.diskTemp.name"), this.plugin.settings.diskTemp, 1500, 4e4, 100, (v) => {
      this.plugin.settings.diskTemp = v;
    });
    this.slider(t2("settings.dopplerMix.name"), this.plugin.settings.dopplerMix, 0, 1, 0.01, (v) => {
      this.plugin.settings.dopplerMix = v;
    });
    this.slider(t2("settings.diskBeam.name"), this.plugin.settings.diskBeam, 0, 10, 0.1, (v) => {
      this.plugin.settings.diskBeam = v;
    });
    containerEl.createEl("h3", { text: t2("settings.section.performance") });
    new import_obsidian.Setting(containerEl).setName(t2("settings.nSteps.name")).setDesc(t2("settings.nSteps.desc")).addSlider((sl) => {
      sl.setLimits(6, 10, 1);
      sl.setValue(this.plugin.settings.nSteps);
      sl.setDynamicTooltip();
      sl.onChange(async (v) => {
        this.plugin.settings.nSteps = v;
        await this.plugin.saveSettings();
        this.plugin.onParamsChange();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t2("settings.renderScale.name")).setDesc(t2("settings.renderScale.desc")).addSlider((sl) => {
      sl.setLimits(0.15, 0.35, 0.05);
      sl.setValue(this.plugin.settings.renderScale);
      sl.setDynamicTooltip();
      sl.onChange(async (v) => {
        this.plugin.settings.renderScale = v;
        await this.plugin.saveSettings();
        this.plugin.applyRuntimeSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t2("settings.captureEnabled.name")).setDesc(t2("settings.captureEnabled.desc")).addToggle((tg) => {
      tg.setValue(this.plugin.settings.captureEnabled);
      tg.onChange(async (v) => {
        this.plugin.settings.captureEnabled = v;
        await this.plugin.saveSettings();
        this.plugin.applyRuntimeSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(t2("settings.captureInterval.name")).setDesc(t2("settings.captureInterval.desc")).addSlider((sl) => {
      sl.setLimits(2500, 6e3, 250);
      sl.setValue(this.plugin.settings.captureIntervalMs);
      sl.setDynamicTooltip();
      sl.onChange(async (v) => {
        this.plugin.settings.captureIntervalMs = v;
        await this.plugin.saveSettings();
        this.plugin.applyRuntimeSettings();
      });
    });
    this.slider(t2("settings.tokenAreaMax.name"), this.plugin.settings.tokenAreaMax * 1e3, 0.1, 20, 0.1, (v) => {
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
        this.plugin.onParamsChange();
      });
    }).addText((txt) => {
      txt.setValue(String(value));
      txt.onChange(async (s) => {
        const v = parseFloat(s);
        if (!isNaN(v) && v >= min && v <= max) {
          onChange(v);
          await this.plugin.saveSettings();
          this.plugin.onParamsChange();
        }
      });
    });
  }
};

// src/shader.ts
var VS = `#version 300 es
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main() {
    vUv = aPos * 0.5 + 0.5;
    gl_Position = vec4(aPos, 0.0, 1.0);
}
`;
function makeFS(p, useMediump = false) {
  return `#version 300 es
precision ${useMediump ? "mediump" : "highp"} float;
precision ${useMediump ? "mediump" : "highp"} int;

// ---- uniforms (set by renderer every frame) ----
uniform vec2  uResolution;
uniform float uTime;
uniform float uTimeDelta;
uniform int   uFrame;
uniform sampler2D uTexture;
uniform vec4  uDate;
uniform float uLastActivity;
uniform float uTokenLevel;
uniform float uTokenPrev;
uniform float uTokenChangeTime;
uniform int   uSizeMode;
uniform int   uCaptureEnabled;
uniform vec2  uViewportOrigin;
uniform vec2  uViewportSize;

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
const float ALPHA_EPS       = 0.0100;
const float SIZE_GAIN       = 0.5500;

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
    vec2 uv = uViewportOrigin + vUv * uViewportSize;
    vec2  res    = uResolution;
    float aspect = res.x / res.y;
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
        float ext = (rout / B_CRIT) * HOLE_RADIUS * sz * SIZE_GAIN;
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
            lvl = glidedToken(uTokenLevel, uTokenPrev, uTokenChangeTime);
        }
        if (lvl < 0.0) { fragColor = vec4(0.0); return; }
        float g = pow(clamp(lvl, 0.0, 1.0), TOKEN_EASE);
        I = mix(0.10, 1.0, g);
        float rhMin = sqrt(TOKEN_AREA_MIN * aspect / 3.1415927);
        float rhMax = sqrt(TOKEN_AREA_MAX * aspect / 3.1415927);
        float rhT = mix(rhMin, rhMax, g) * (HOLE_RADIUS / 0.08) * SIZE_GAIN;
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
        fragColor = vec4(0.0);
        return;
    }
    float rh = HOLE_RADIUS * sz * SIZE_GAIN;
    float dil = mix(1.0, DILATION_MIN, I);
    // Overlay model: the canvas is transparent except near the hole, so the
    // live Obsidian DOM shows through everywhere else. "shield" is the effect
    // coverage; we no longer gate it to a work-area band \u2014 the hole roams the
    // whole window.
    float shield = vis;

    vec2  p    = (uv - center) * vec2(aspect, 1.0);
    float plen = length(p);

    float W  = B_CRIT / max(rh, 1e-4);
    vec2  pr = rot(vec2(p.x, -p.y), L.roll) * W;
    float b  = length(pr);

    float window = exp(-pow(plen / (7.0 * rh), 2.0));
    float cover = window * shield;
    if (cover < ALPHA_EPS) {
        fragColor = vec4(0.0);
        return;
    }

    float bmax = rout + 3.0;
    float Z0   = max(14.0, rout + 5.0);

    // far field
    if (b >= bmax) {
        vec3  term = vec3(0.0);
        if (uCaptureEnabled != 0) {
            float uu   = Z0 * inversesqrt(Z0 * Z0 + b * b);
            float defl = (2.0 / (W * W)) / max(plen, 1e-4)
                       * (1.29 * uu + 0.07) * max(LENS_DEPTH - 2.14 * uu + 0.75, 0.0)
                       * cover;
            vec2  dir  = p / max(plen, 1e-5);
            vec2  sp   = p - dir * defl;
            vec2  suv  = mirrorUV(center + sp / vec2(aspect, 1.0));
            term = texture(uTexture, suv).rgb;
        }
        vec3 sky = vec3(0.0);
        if (L.star > 0.0) {
            vec3 dd = normalize(vec3(-(pr / b) * (2.0 / b), -1.0));
            sky = stars(dd) * L.star * cover;
        }
        // straight-alpha overlay: coverage fades out away from the hole so the
        // live DOM shows through; near the hole we reveal the lensed sample.
        float a = clamp(cover, 0.0, 1.0);
        fragColor = vec4(term + sky, a);
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
        if (L.star > 0.0) {
            bg += stars(dd) * L.star * cover;
        }
        if (uCaptureEnabled != 0 && dd.z < -0.05) {
            float tpl = (-LENS_DEPTH - x.z) / dd.z;
            vec3  hp  = x + dd * tpl;
            vec2  q   = rot(hp.xy, -L.roll) / W;
            vec2  sp  = vec2(q.x, -q.y);
            vec2  suv = mirrorUV(center + (p + (sp - p) * cover) / vec2(aspect, 1.0));
            float toward = smoothstep(0.05, 0.35, -dd.z);
            bg += texture(uTexture, suv).rgb * toward;
        }
    }

    vec3 emitRGB = vec3(1.0) - exp(-emitc * L.expo);
    float emitLum = max(emitRGB.r, max(emitRGB.g, emitRGB.b));
    vec3 col = bg * trans + emitRGB;
    // Coverage: opaque inside the shadow, bright where the disk emits, and the
    // lensing window elsewhere \u2014 transparent (live DOM) far from the hole.
    float a = captured ? 1.0 : clamp(max(cover, emitLum), 0.0, 1.0);
    fragColor = vec4(col, a);
}
`;
}

// src/renderer.ts
var POSITION_ATTRIB_LOCATION = 0;
var MODE_POMODORO = 0;
var MODE_DEMO = 2;
var DEMO_SEC = 42;
var DEMO_GROW_SEC = 40;
var B_CRIT = 2.5980762;
var EFFECT_ALPHA_CUTOFF = 0.01;
var SIZE_GAIN = 0.55;
var VIEWPORT_PAD_PX = 24;
var VIEWPORT_SNAP_PX = 32;
var DEFAULT_FRAME_INTERVAL_MS = 1e3 / 18;
var SOFTWARE_FRAME_INTERVAL_MS = 1e3 / 10;
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
function mix(a, b, t2) {
  return a + (b - a) * t2;
}
function smoothstep(edge0, edge1, value) {
  if (edge0 === edge1)
    return value < edge0 ? 0 : 1;
  const t2 = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t2 * t2 * (3 - 2 * t2);
}
function positiveMod(value, mod) {
  return (value % mod + mod) % mod;
}
function lissa(t2) {
  return {
    x: 0.75 * Math.sin(t2 * 0.37) + 0.25 * Math.sin(t2 * 0.83 + 1),
    y: 0.7 * Math.sin(t2 * 0.54 + 2.1) + 0.3 * Math.sin(t2 * 1.07)
  };
}
var BlackHoleRenderer = class {
  constructor(canvas, params) {
    this.gl = null;
    this.program = null;
    this.vao = null;
    this.vertexBuffer = null;
    this.animId = 0;
    this.running = false;
    this.workspaceTex = null;
    // state
    this.tokenLevel = 0;
    this.prevTokenLevel = 0;
    this.lastTokenChange = 0;
    this.lastTokenLevel = 0;
    this.lastActivity = 0;
    this.sizeMode = 1;
    this.captureEnabled = false;
    // perf
    this.softwareRenderer = false;
    /** When true, auto-drop render scale if frames stay slow. */
    this.autoQuality = true;
    /** Backing-store resolution factor (CSS px × this). The canvas is stretched
     *  to 100% via CSS, so < 1 renders fewer fragments — a big GPU win. */
    this.renderScale = 1;
    this.minRenderScale = 0.25;
    this.dtAvg = 0;
    // EMA of frame time (s)
    this.lastScaleAdjust = 0;
    // timestamp guard for auto-downscale
    this.prevTime = 0;
    this.lastDrawTime = 0;
    this.frameCount = 0;
    this.startTime = 0;
    this.frameIntervalMs = DEFAULT_FRAME_INTERVAL_MS;
    this.viewportRect = null;
    this.loop = (now) => {
      if (!this.running || !this.gl || !this.program)
        return;
      this.animId = requestAnimationFrame(this.loop);
      if (this.lastDrawTime && now - this.lastDrawTime < this.frameIntervalMs)
        return;
      try {
        this.renderFrame(now);
        this.lastDrawTime = now;
      } catch (e) {
        console.error("BlackHole: render loop error \u2014 stopping renderer.", e);
        this.stop();
      }
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
      preserveDrawingBuffer: false,
      // Ask the OS/Electron for the discrete/high-performance GPU rather than
      // an integrated or software fallback — the geodesic shader is heavy.
      powerPreference: "high-performance",
      // Let the compositor present without forcing main-thread sync each frame.
      desynchronized: true
    });
    if (!gl)
      return false;
    this.gl = gl;
    try {
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      const rendererName = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
      console.info("BlackHole: WebGL renderer =", rendererName || "(unknown)");
      this.softwareRenderer = /swiftshader|llvmpipe|software|basic render/i.test(rendererName);
      if (this.softwareRenderer) {
        this.frameIntervalMs = SOFTWARE_FRAME_INTERVAL_MS;
        const isWayland = typeof navigator !== "undefined" && /Wayland|wayland/i.test(navigator.userAgent);
        console.warn(
          "BlackHole: running on a SOFTWARE WebGL renderer (" + rendererName + "). Hardware GPU is not being used for WebGL.\n" + (isWayland ? "This is a known Electron+Wayland+NVIDIA issue. Fix:\n  Run Obsidian with --ozone-platform=x11 via ~/.config/obsidian/user-flags.conf\n  (created automatically \u2014 restart Obsidian to apply)." : 'Check that your GPU drivers are installed and Obsidian/Electron is not started with --disable-gpu.\n  See Settings > Appearance > Advanced and ensure "Hardware acceleration" is ON.')
        );
      }
    } catch {
    }
    if (!this.buildProgram())
      return false;
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(POSITION_ATTRIB_LOCATION);
    gl.vertexAttribPointer(POSITION_ATTRIB_LOCATION, 2, gl.FLOAT, false, 0, 0);
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
    gl.clearColor(0, 0, 0, 0);
    this.canvas.style.left = "0";
    this.canvas.style.top = "0";
    this.canvas.style.width = "1px";
    this.canvas.style.height = "1px";
    this.canvas.style.transform = "translate3d(0, 0, 0)";
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
    this.lastDrawTime = 0;
    this.startTime = this.prevTime;
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
    this.viewportRect = null;
    this.updateViewportRect({ x: 0, y: 0, width: 1, height: 1 });
  }
  /** Set the backing-store resolution factor and re-size immediately. */
  setRenderScale(scale) {
    this.renderScale = Math.max(this.minRenderScale, Math.min(1, scale));
    if (this.viewportRect)
      this.updateViewportRect(this.viewportRect);
    else
      this.resize();
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
    if (gl && this.vao)
      gl.deleteVertexArray(this.vao);
    if (gl && this.vertexBuffer)
      gl.deleteBuffer(this.vertexBuffer);
    if (gl && this.workspaceTex)
      gl.deleteTexture(this.workspaceTex);
    this.program = null;
    this.vao = null;
    this.vertexBuffer = null;
    this.workspaceTex = null;
    this.gl = null;
  }
  // ---- internal ----
  buildProgram() {
    const gl = this.gl;
    const vs = this.compile(gl.VERTEX_SHADER, VS);
    const fs = this.compile(gl.FRAGMENT_SHADER, makeFS(this.params, this.softwareRenderer));
    if (!vs || !fs)
      return false;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, POSITION_ATTRIB_LOCATION, "aPos");
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("Shader link error:", gl.getProgramInfoLog(prog));
      gl.deleteProgram(prog);
      return false;
    }
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
    this.uTokenPrev = gl.getUniformLocation(prog, "uTokenPrev");
    this.uTokenChangeTime = gl.getUniformLocation(prog, "uTokenChangeTime");
    this.uSizeMode = gl.getUniformLocation(prog, "uSizeMode");
    this.uCaptureEnabled = gl.getUniformLocation(prog, "uCaptureEnabled");
    this.uViewportOrigin = gl.getUniformLocation(prog, "uViewportOrigin");
    this.uViewportSize = gl.getUniformLocation(prog, "uViewportSize");
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
  renderFrame(now) {
    const gl = this.gl;
    const dt = Math.min((now - this.prevTime) / 1e3, 0.1);
    this.prevTime = now;
    this.frameCount++;
    this.dtAvg = this.dtAvg ? this.dtAvg * 0.9 + dt * 0.1 : dt;
    if (this.autoQuality && now - this.startTime > 3e3 && this.dtAvg > 0.033 && this.renderScale > this.minRenderScale && now - this.lastScaleAdjust > 2e3) {
      this.lastScaleAdjust = now;
      this.setRenderScale(this.renderScale - 0.15);
      console.warn(
        `BlackHole: low FPS (~${Math.round(1 / this.dtAvg)}) \u2014 render scale \u2192 ${this.renderScale.toFixed(2)}`
      );
      this.dtAvg = 0.025;
    }
    gl.useProgram(this.program);
    const d = /* @__PURE__ */ new Date();
    const viewportSize = this.getViewportSize();
    if (!viewportSize) {
      this.hideCanvas();
      return;
    }
    const bounds = this.computeEffectBounds(now / 1e3, d, viewportSize.width, viewportSize.height);
    if (!bounds) {
      this.hideCanvas();
      return;
    }
    const viewportRect = this.ensureViewportRect(bounds, viewportSize.width, viewportSize.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(this.uResolution, viewportSize.width, viewportSize.height);
    gl.uniform2f(
      this.uViewportOrigin,
      viewportRect.x / viewportSize.width,
      viewportRect.y / viewportSize.height
    );
    gl.uniform2f(
      this.uViewportSize,
      viewportRect.width / viewportSize.width,
      viewportRect.height / viewportSize.height
    );
    gl.uniform1f(this.uTime, now / 1e3);
    gl.uniform1f(this.uTimeDelta, dt);
    gl.uniform1i(this.uFrame, this.frameCount);
    gl.uniform1f(this.uLastActivity, this.lastActivity);
    gl.uniform4f(
      this.uDate,
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate(),
      d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()
    );
    if (this.lastTokenLevel !== this.tokenLevel) {
      this.prevTokenLevel = this.lastTokenLevel;
      this.lastTokenLevel = this.tokenLevel;
      this.lastTokenChange = now / 1e3;
    }
    gl.uniform1f(this.uTokenLevel, this.tokenLevel);
    gl.uniform1f(this.uTokenPrev, this.prevTokenLevel);
    gl.uniform1f(this.uTokenChangeTime, this.lastTokenChange);
    gl.uniform1i(this.uSizeMode, this.sizeMode);
    gl.uniform1i(this.uCaptureEnabled, this.captureEnabled ? 1 : 0);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
  }
  computeEffectBounds(nowSec, date, viewportWidth, viewportHeight) {
    const p = this.params;
    const aspect = viewportWidth / viewportHeight;
    const holeRadius = Math.max(p.holeRadius, 1e-4);
    let intensity = 0;
    let size = 0;
    let center;
    if (this.sizeMode === MODE_POMODORO) {
      const workSec = p.workPeriodMin * 60;
      const cycleSec = workSec + p.breakMin * 60;
      const wall = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
      const phase = positiveMod(wall, cycleSec);
      const collapse = Math.min(60, workSec * 0.15);
      const grow = clamp(phase / workSec, 0, 1) * (1 - smoothstep(workSec - collapse, workSec, phase));
      intensity = mix(0.12, 1, grow);
      const idle = Math.max(0, nowSec - this.lastActivity);
      intensity *= 1 - smoothstep(
        p.idleFadeSec,
        Math.max(p.breakMin * 60, p.idleFadeSec + 1),
        idle
      );
      size = mix(0.22, 1, intensity);
      const diskOuter = Math.max(p.diskOuter, Math.max(p.diskInner, 1.6) + 0.5);
      const ext = diskOuter / B_CRIT * holeRadius * size * SIZE_GAIN;
      const yLo = p.workArea + 0.12 + ext;
      const yHi = Math.max(yLo, 0.9 - ext);
      const speed = mix(0.35, 1, intensity);
      const t2 = nowSec * p.driftSpeed;
      center = {
        x: 0.5 + (0.24 * Math.sin(t2 * 0.21) + 0.05 * Math.sin(t2 * 0.083)) * speed,
        y: 1 - mix(
          yLo,
          yHi,
          0.5 + (0.42 * Math.sin(t2 * 0.157 + 2) + 0.08 * Math.sin(t2 * 0.117)) * speed
        )
      };
      center = {
        x: center.x + intensity * (0.04 * Math.sin(t2 * 0.83) + 0.02 * Math.sin(t2 * 1.31)),
        y: center.y + intensity * (0.03 * Math.sin(t2 * 1.03 + 1))
      };
    } else {
      const level = this.sizeMode === MODE_DEMO ? Math.min(positiveMod(nowSec, DEMO_SEC) / DEMO_GROW_SEC, 1) : this.glidedToken(nowSec);
      if (level < 0)
        return null;
      const g = Math.pow(clamp(level, 0, 1), p.tokenEase);
      intensity = mix(0.1, 1, g);
      const rhMin = Math.sqrt(p.tokenAreaMin * aspect / Math.PI);
      const rhMax = Math.sqrt(p.tokenAreaMax * aspect / Math.PI);
      const rhT = mix(rhMin, rhMax, g) * (holeRadius / 0.08) * SIZE_GAIN;
      size = rhT / holeRadius;
      const margin = Math.min(rhT * mix(1.45, 0.9, g), 0.5 * (1 - p.workArea - 0.03));
      const xPad = margin / aspect;
      const fullLo = { x: Math.min(xPad, 0.5), y: margin };
      const fullHi = {
        x: Math.max(0.5, 1 - xPad),
        y: Math.max(margin, 1 - (p.workArea + 0.03 + margin))
      };
      const corner = {
        x: clamp(p.tokenHomeX, fullLo.x, fullHi.x),
        y: clamp(p.tokenHomeY, fullLo.y, fullHi.y)
      };
      const reach = mix(0.06, Math.max(p.tokenReach, 0.06), g);
      const lo = { x: mix(corner.x, fullLo.x, reach), y: fullLo.y };
      const hi = { x: fullHi.x, y: mix(corner.y, fullHi.y, reach) };
      const room = {
        x: Math.max((hi.x - lo.x) * 0.5, 0),
        y: Math.max((hi.y - lo.y) * 0.5, 0)
      };
      const wobble = {
        x: Math.min(0.01 + 0.03 * g, Math.max(room.x * 0.35, 6e-3)),
        y: Math.min(0.01 + 0.03 * g, Math.max(room.y * 0.35, 6e-3))
      };
      const amplitude = {
        x: Math.max(room.x - wobble.x, 0),
        y: Math.max(room.y - wobble.y, 0)
      };
      const t2 = nowSec * p.driftSpeed;
      const calm = lissa(t2 * p.tokenCalm);
      const rush = lissa(t2 * p.tokenRush);
      const wander = {
        x: mix(calm.x, rush.x, g),
        y: mix(calm.y, rush.y, g)
      };
      center = {
        x: (lo.x + hi.x) * 0.5 + wander.x * amplitude.x + wobble.x * Math.cos(t2 * 0.8),
        y: (lo.y + hi.y) * 0.5 + wander.y * amplitude.y + wobble.y * Math.sin(t2 * 1)
      };
    }
    const shield = smoothstep(0, 0.1, intensity);
    if (shield <= 0)
      return null;
    const rh = holeRadius * size * SIZE_GAIN;
    const effectRadius = Math.max(
      rh * 3,
      7 * rh * Math.sqrt(-Math.log(EFFECT_ALPHA_CUTOFF / Math.max(shield, EFFECT_ALPHA_CUTOFF)))
    ) + rh * 2;
    const radiusX = effectRadius / Math.max(aspect, 1e-4);
    const radiusY = effectRadius;
    const x0 = clamp(Math.floor((center.x - radiusX) * viewportWidth), 0, viewportWidth);
    const x1 = clamp(Math.ceil((center.x + radiusX) * viewportWidth), 0, viewportWidth);
    const y0 = clamp(Math.floor((center.y - radiusY) * viewportHeight), 0, viewportHeight);
    const y1 = clamp(Math.ceil((center.y + radiusY) * viewportHeight), 0, viewportHeight);
    if (x1 <= x0 || y1 <= y0)
      return null;
    return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
  }
  getViewportSize() {
    const parent = this.canvas.parentElement;
    if (!parent)
      return null;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    if (width === 0 || height === 0)
      return null;
    return { width, height };
  }
  ensureViewportRect(bounds, viewportWidth, viewportHeight) {
    const pad = VIEWPORT_PAD_PX;
    const snap = VIEWPORT_SNAP_PX;
    const x0 = clamp(Math.floor((bounds.x - pad) / snap) * snap, 0, viewportWidth);
    const y0 = clamp(Math.floor((bounds.y - pad) / snap) * snap, 0, viewportHeight);
    const x1 = clamp(Math.ceil((bounds.x + bounds.width + pad) / snap) * snap, 1, viewportWidth);
    const y1 = clamp(Math.ceil((bounds.y + bounds.height + pad) / snap) * snap, 1, viewportHeight);
    const next = {
      x: x0,
      y: y0,
      width: Math.max(1, x1 - x0),
      height: Math.max(1, y1 - y0)
    };
    const prev = this.viewportRect;
    if (!prev || prev.x !== next.x || prev.y !== next.y || prev.width !== next.width || prev.height !== next.height) {
      this.viewportRect = next;
      this.updateViewportRect(next);
      return next;
    }
    return prev;
  }
  updateViewportRect(rect) {
    if (!this.gl)
      return;
    const renderScale = Math.max(this.minRenderScale, Math.min(1, this.renderScale));
    const backingWidth = Math.max(1, Math.round(rect.width * renderScale));
    const backingHeight = Math.max(1, Math.round(rect.height * renderScale));
    if (this.canvas.width !== backingWidth || this.canvas.height !== backingHeight) {
      this.canvas.width = backingWidth;
      this.canvas.height = backingHeight;
      this.gl.viewport(0, 0, backingWidth, backingHeight);
    }
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.canvas.style.transform = `translate3d(${rect.x}px, ${rect.y}px, 0)`;
  }
  hideCanvas() {
    this.viewportRect = null;
    this.canvas.style.width = "0px";
    this.canvas.style.height = "0px";
  }
  glidedToken(nowSec) {
    const cur = this.tokenLevel;
    const prev = this.prevTokenLevel;
    if (cur < 0)
      return -1;
    if (prev < 0)
      return cur;
    const duration = clamp(
      Math.abs(cur - prev) * this.params.tokenGlideRate,
      this.params.tokenGlideMin,
      this.params.tokenGlideMax
    );
    return mix(prev, cur, smoothstep(0, duration, nowSec - this.lastTokenChange));
  }
};

// src/capture.ts
var domToImage = __toESM(require_dom_to_image_more_min());
var DEFAULT_INTERVAL = 1500;
var MAX_INTERVAL = 4e3;
var DEFAULT_SCALE = 0.25;
var SLOW_BACKOFF = 3;
var MAX_CONSECUTIVE_FAILURES = 5;
var WorkspaceCapture = class {
  constructor() {
    this.lastCapture = 0;
    this.el = null;
    this.failed = false;
    this.failures = 0;
    this.inFlight = false;
    // don't overlap captures
    this.baseInterval = DEFAULT_INTERVAL;
    this.currentInterval = DEFAULT_INTERVAL;
    this.scale = DEFAULT_SCALE;
    this.enabled = true;
    this.onCapture = null;
    /** The most recent successfully captured canvas. */
    this.latestCanvas = null;
    /** Time of the latest successful capture (monotonic). */
    this.latestCaptureTime = 0;
  }
  setElement(el) {
    this.el = el;
  }
  /** Tune cadence / resolution / on-off from settings. */
  setOptions(opts) {
    if (opts.enabled !== void 0) {
      const wasEnabled = this.enabled;
      this.enabled = opts.enabled;
      if (!wasEnabled && this.enabled)
        this.reset();
    }
    if (opts.intervalMs !== void 0) {
      this.baseInterval = Math.max(100, opts.intervalMs);
      this.currentInterval = Math.max(this.currentInterval, this.baseInterval);
    }
    if (opts.scale !== void 0)
      this.scale = Math.max(0.1, Math.min(1, opts.scale));
  }
  /**
   * Trigger an async capture. Returns `true` if a capture was initiated.
   * Resolves by updating `latestCanvas` when dom-to-image finishes.
   * Rate-limited and self-throttling.
   */
  capture(now) {
    if (!this.enabled || this.failed || !this.el || this.inFlight)
      return false;
    if (now - this.lastCapture < this.currentInterval)
      return false;
    const el = this.el;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w === 0 || h === 0)
      return false;
    this.lastCapture = now;
    const started = performance.now();
    this.inFlight = true;
    try {
      const options = {
        width: w,
        height: h,
        scale: this.scale,
        // CRITICAL: do not let dom-to-image fetch fonts or images. In Obsidian
        // those resolve to `app://` URLs served by the *main process* protocol
        // handler, which decodeURIComponent()s the path and throws an uncaught
        // "URI malformed" — crashing the whole app. A renderer try/catch can't
        // catch a main-process throw, so we must avoid issuing the request.
        // The lensed texture only needs the workspace text/layout, not media.
        disableEmbedFonts: true,
        disableInlineImages: true,
        // reading cross-origin stylesheet cssRules can also throw synchronously
        ignoreCSSRuleErrors: true,
        // Faster, slightly less exact cache keys for computed styles.
        styleCaching: "relaxed",
        // belt-and-suspenders: block any remaining non-data URL from being fetched
        filterUrls: (url) => url.startsWith("data:"),
        filter: (n) => {
          if (n instanceof HTMLElement && n.classList.contains("blackhole-canvas"))
            return false;
          return true;
        }
      };
      domToImage.toCanvas(el, options).then((canvas) => {
        this.latestCanvas = canvas;
        this.latestCaptureTime = performance.now();
        this.failures = 0;
        this.adjustInterval(performance.now() - started);
        this.onCapture?.(canvas, this.latestCaptureTime);
      }).catch((e) => {
        this.noteFailure(e);
      }).then(() => {
        this.inFlight = false;
      });
    } catch (e) {
      this.inFlight = false;
      this.noteFailure(e);
      return false;
    }
    return true;
  }
  /** Widen the interval when a capture is expensive so we never spend more
   *  time blocking the main thread than the budget allows. */
  adjustInterval(durationMs) {
    this.currentInterval = Math.min(
      MAX_INTERVAL,
      Math.max(this.baseInterval, Math.round(durationMs * SLOW_BACKOFF))
    );
  }
  noteFailure(e) {
    this.failures++;
    if (this.failures >= MAX_CONSECUTIVE_FAILURES) {
      this.failed = true;
      console.error(
        `BlackHole: workspace capture failed ${this.failures}\xD7 \u2014 disabling capture; the shader will render disk/starfield only.`,
        e
      );
    }
  }
  /** Reset failure/backoff state (e.g. after a mode change). */
  reset() {
    this.failed = false;
    this.failures = 0;
    this.currentInterval = this.baseInterval;
  }
  /** Force the next poll to capture immediately (e.g. content changed). */
  requestSoon() {
    this.lastCapture = 0;
  }
  /** A transparent placeholder canvas to seed the texture before first capture. */
  static blankCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w * DEFAULT_SCALE));
    c.height = Math.max(1, Math.round(h * DEFAULT_SCALE));
    return c;
  }
};

// src/i18n.ts
var translations = {
  en: {
    "ribbon.toggle": "Toggle Black Hole",
    "notice.enabled": "Black hole ON",
    "notice.disabled": "Black hole OFF",
    "notice.startFailed": "Black Hole failed to start \u2014 see console for details.",
    "notice.requireWebgl2": "Black Hole plugin requires WebGL2",
    "notice.softwareReduced": "Black Hole: no GPU acceleration detected \u2014 quality reduced hard for usability. Tune it under Settings \u2192 Performance.",
    "settings.title": "Black Hole Settings",
    "settings.general": "General",
    "settings.language.name": "Language",
    "settings.language.desc": "UI language for this plugin",
    "settings.language.auto": "Auto",
    "settings.language.en": "English",
    "settings.language.zh-CN": "Simplified Chinese",
    "settings.playback": "Playback",
    "settings.idleOnly.name": "Idle-Only Playback",
    "settings.idleOnly.desc": "Only play the black hole after you have been idle for the configured delay. Any new activity stops it immediately.",
    "settings.idleDelay.name": "Idle Start Delay (sec)",
    "settings.idleDelay.desc": "How long you must stay inactive before the animation starts",
    "settings.mode.name": "Size Mode",
    "settings.mode.desc": "What drives the hole's growth",
    "settings.mode.pomodoro": "Pomodoro \u2014 wall-clock work/break cycle",
    "settings.mode.token": "Token \u2014 word count / custom metric",
    "settings.mode.demo": "Demo \u2014 self-running showcase loop",
    "settings.tokenMetric.name": "Token Metric",
    "settings.tokenMetric.desc": "What drives the hole in token mode",
    "settings.tokenMetric.word": "Current note word count",
    "settings.tokenMetric.global": "Vault-wide word count",
    "settings.tokenMetric.file": "Vault file count",
    "settings.tokenMetric.tab": "Open tab count",
    "settings.maxWordCount.name": "Max Word Count",
    "settings.maxWordCount.desc": "Word count at which the hole reaches 100% size (token mode)",
    "settings.section.pomodoro": "Pomodoro",
    "settings.workPeriod.name": "Work Period (min)",
    "settings.break.name": "Break (min)",
    "settings.idleFade.name": "Idle Fade (sec)",
    "settings.idleFade.desc": "Typing pause after which the hole starts to shrink",
    "settings.section.hole": "Hole & Lensing",
    "settings.holeRadius.name": "Hole Radius",
    "settings.lensDepth.name": "Lens Depth",
    "settings.starGain.name": "Star Gain",
    "settings.section.disk": "Accretion Disk",
    "settings.diskInner.name": "Disk Inner",
    "settings.diskOuter.name": "Disk Outer",
    "settings.diskIncl.name": "Inclination",
    "settings.diskRoll.name": "Roll",
    "settings.diskGain.name": "Gain",
    "settings.diskOpacity.name": "Opacity",
    "settings.diskTemp.name": "Temperature (K)",
    "settings.dopplerMix.name": "Doppler Mix",
    "settings.diskBeam.name": "Beaming",
    "settings.section.performance": "Performance",
    "settings.nSteps.name": "Integration Steps",
    "settings.nSteps.desc": "Geodesic steps per pixel \u2014 higher = more accurate but slower",
    "settings.renderScale.name": "Render Scale",
    "settings.renderScale.desc": "Resolution the shader renders at. Lower is much faster on weak or software GPUs.",
    "settings.captureEnabled.name": "Capture Workspace",
    "settings.captureEnabled.desc": "Warp your actual notes into the lens. Turn OFF if the UI stutters \u2014 the hole then lenses the starfield only.",
    "settings.captureInterval.name": "Capture Interval (ms)",
    "settings.captureInterval.desc": "How often the workspace is re-captured. Higher = smoother UI, less responsive lensing.",
    "settings.tokenAreaMax.name": "Token Area Max (\xD71e-3)"
  },
  "zh-CN": {
    "ribbon.toggle": "\u5207\u6362\u9ED1\u6D1E",
    "notice.enabled": "\u9ED1\u6D1E\u5DF2\u5F00\u542F",
    "notice.disabled": "\u9ED1\u6D1E\u5DF2\u5173\u95ED",
    "notice.startFailed": "\u9ED1\u6D1E\u63D2\u4EF6\u542F\u52A8\u5931\u8D25\uFF0C\u8BF7\u67E5\u770B\u63A7\u5236\u53F0\u65E5\u5FD7\u3002",
    "notice.requireWebgl2": "\u9ED1\u6D1E\u63D2\u4EF6\u9700\u8981 WebGL2 \u624D\u80FD\u8FD0\u884C",
    "notice.softwareReduced": "\u68C0\u6D4B\u5230\u672A\u4F7F\u7528 GPU \u52A0\u901F\uFF0C\u5DF2\u5F3A\u5236\u964D\u4F4E\u8D28\u91CF\u4EE5\u4FDD\u8BC1\u53EF\u7528\u6027\u3002\u53EF\u5728\u8BBE\u7F6E \u2192 \u6027\u80FD\u4E2D\u7EE7\u7EED\u8C03\u6574\u3002",
    "settings.title": "\u9ED1\u6D1E\u8BBE\u7F6E",
    "settings.general": "\u901A\u7528",
    "settings.language.name": "\u8BED\u8A00",
    "settings.language.desc": "\u6B64\u63D2\u4EF6\u7684\u754C\u9762\u8BED\u8A00",
    "settings.language.auto": "\u81EA\u52A8",
    "settings.language.en": "\u82F1\u6587",
    "settings.language.zh-CN": "\u7B80\u4F53\u4E2D\u6587",
    "settings.playback": "\u64AD\u653E\u63A7\u5236",
    "settings.idleOnly.name": "\u4EC5\u5728\u95F2\u7F6E\u65F6\u64AD\u653E",
    "settings.idleOnly.desc": "\u53EA\u6709\u5728\u4F60\u505C\u6B62\u64CD\u4F5C\u8FBE\u5230\u8BBE\u5B9A\u65F6\u957F\u540E\u624D\u64AD\u653E\u9ED1\u6D1E\u52A8\u753B\uFF0C\u4E00\u65E6\u91CD\u65B0\u64CD\u4F5C\u5C31\u7ACB\u5373\u505C\u6B62\u3002",
    "settings.idleDelay.name": "\u95F2\u7F6E\u542F\u52A8\u5EF6\u65F6\uFF08\u79D2\uFF09",
    "settings.idleDelay.desc": "\u9700\u8981\u4FDD\u6301\u65E0\u64CD\u4F5C\u591A\u4E45\u540E\u624D\u5F00\u59CB\u64AD\u653E\u52A8\u753B",
    "settings.mode.name": "\u5C3A\u5BF8\u6A21\u5F0F",
    "settings.mode.desc": "\u51B3\u5B9A\u9ED1\u6D1E\u589E\u957F\u65B9\u5F0F",
    "settings.mode.pomodoro": "\u756A\u8304\u949F\uFF1A\u6309\u5DE5\u4F5C / \u4F11\u606F\u65F6\u95F4\u5FAA\u73AF\u53D8\u5316",
    "settings.mode.token": "\u5B57\u6570\uFF1A\u6309\u5B57\u6570 / \u6307\u6807\u53D8\u5316",
    "settings.mode.demo": "\u6F14\u793A\uFF1A\u81EA\u52A8\u5C55\u793A\u6548\u679C",
    "settings.tokenMetric.name": "\u5B57\u6570\u6307\u6807",
    "settings.tokenMetric.desc": "\u5B57\u6570\u6A21\u5F0F\u4E0B\u7528\u4E8E\u9A71\u52A8\u9ED1\u6D1E\u7684\u6307\u6807",
    "settings.tokenMetric.word": "\u5F53\u524D\u7B14\u8BB0\u5B57\u6570",
    "settings.tokenMetric.global": "\u6574\u4E2A\u4ED3\u5E93\u4F30\u7B97\u5B57\u6570",
    "settings.tokenMetric.file": "\u4ED3\u5E93\u6587\u4EF6\u6570",
    "settings.tokenMetric.tab": "\u5DF2\u6253\u5F00\u6807\u7B7E\u6570",
    "settings.maxWordCount.name": "\u6700\u5927\u5B57\u6570",
    "settings.maxWordCount.desc": "\u8FBE\u5230\u8BE5\u5B57\u6570\u65F6\u9ED1\u6D1E\u589E\u957F\u5230 100%\uFF08\u5B57\u6570\u6A21\u5F0F\uFF09",
    "settings.section.pomodoro": "\u756A\u8304\u949F",
    "settings.workPeriod.name": "\u5DE5\u4F5C\u65F6\u957F\uFF08\u5206\u949F\uFF09",
    "settings.break.name": "\u4F11\u606F\u65F6\u957F\uFF08\u5206\u949F\uFF09",
    "settings.idleFade.name": "\u7A7A\u95F2\u6DE1\u51FA\uFF08\u79D2\uFF09",
    "settings.idleFade.desc": "\u5728\u756A\u8304\u949F\u6A21\u5F0F\u4E0B\uFF0C\u505C\u6B62\u8F93\u5165\u591A\u4E45\u540E\u9ED1\u6D1E\u5F00\u59CB\u7F29\u5C0F",
    "settings.section.hole": "\u9ED1\u6D1E\u4E0E\u5F15\u529B\u900F\u955C",
    "settings.holeRadius.name": "\u9ED1\u6D1E\u534A\u5F84",
    "settings.lensDepth.name": "\u900F\u955C\u6DF1\u5EA6",
    "settings.starGain.name": "\u661F\u573A\u5F3A\u5EA6",
    "settings.section.disk": "\u5438\u79EF\u76D8",
    "settings.diskInner.name": "\u5185\u534A\u5F84",
    "settings.diskOuter.name": "\u5916\u534A\u5F84",
    "settings.diskIncl.name": "\u503E\u89D2",
    "settings.diskRoll.name": "\u6EDA\u8F6C",
    "settings.diskGain.name": "\u589E\u76CA",
    "settings.diskOpacity.name": "\u900F\u660E\u5EA6",
    "settings.diskTemp.name": "\u6E29\u5EA6\uFF08K\uFF09",
    "settings.dopplerMix.name": "\u591A\u666E\u52D2\u6DF7\u5408",
    "settings.diskBeam.name": "\u675F\u5C04\u5F3A\u5EA6",
    "settings.section.performance": "\u6027\u80FD",
    "settings.nSteps.name": "\u79EF\u5206\u6B65\u6570",
    "settings.nSteps.desc": "\u6BCF\u50CF\u7D20\u7684\u6D4B\u5730\u7EBF\u79EF\u5206\u6B65\u6570\uFF0C\u8D8A\u9AD8\u8D8A\u7CBE\u786E\u4F46\u8D8A\u6162",
    "settings.renderScale.name": "\u6E32\u67D3\u7F29\u653E",
    "settings.renderScale.desc": "\u7740\u8272\u5668\u5B9E\u9645\u6E32\u67D3\u5206\u8FA8\u7387\u3002\u8D8A\u4F4E\u8D8A\u5FEB\uFF0C\u5C24\u5176\u9002\u5408\u5F31 GPU \u6216\u8F6F\u4EF6\u6E32\u67D3\u3002",
    "settings.captureEnabled.name": "\u6355\u83B7\u5DE5\u4F5C\u533A",
    "settings.captureEnabled.desc": "\u628A\u771F\u5B9E\u7B14\u8BB0\u5185\u5BB9\u626D\u66F2\u8FDB\u900F\u955C\u4E2D\u3002\u5982\u679C\u754C\u9762\u5361\u987F\u8BF7\u5173\u95ED\uFF0C\u6B64\u65F6\u53EA\u6E32\u67D3\u661F\u573A\u3002",
    "settings.captureInterval.name": "\u6355\u83B7\u95F4\u9694\uFF08\u6BEB\u79D2\uFF09",
    "settings.captureInterval.desc": "\u91CD\u65B0\u6355\u83B7\u5DE5\u4F5C\u533A\u7684\u9891\u7387\u3002\u8D8A\u9AD8\u8D8A\u6D41\u7545\uFF0C\u4F46\u900F\u955C\u54CD\u5E94\u8D8A\u6162\u3002",
    "settings.tokenAreaMax.name": "\u5B57\u6570\u6A21\u5F0F\u6700\u5927\u9762\u79EF\uFF08\xD71e-3\uFF09"
  }
};
function resolveLocale(language) {
  if (language === "en" || language === "zh-CN")
    return language;
  const detected = (typeof navigator !== "undefined" ? navigator.language : "en").toLowerCase();
  return detected.startsWith("zh") ? "zh-CN" : "en";
}
function t(language, key) {
  const locale = resolveLocale(language);
  return translations[locale][key] ?? translations.en[key];
}

// src/main.ts
var MAX_RENDER_SCALE = 0.35;
var MAX_RENDER_SCALE_SOFTWARE = 0.22;
var MAX_SHADER_STEPS = 10;
var MAX_HOLE_RADIUS = 0.014;
var MAX_TOKEN_AREA_MIN = 3e-3;
var MAX_TOKEN_AREA_MAX = 0.02;
var MAX_DISK_OUTER = 7;
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
    this.leafChangeRef = null;
    this.layoutChangeRef = null;
    this.idleResumeTimeoutId = 0;
    this.playbackSuspended = false;
    this.recompileSoon = (0, import_obsidian2.debounce)(() => {
      if (this.renderer)
        this.renderer.recompile(this.toShaderParams());
    }, 200, true);
    // Re-capture once scrolling settles (trailing debounce) rather than on every
    // scroll event — keeps the snapshot current without thrashing dom-to-image.
    this.requestCaptureSoon = (0, import_obsidian2.debounce)(() => {
      this.capture?.requestSoon();
    }, 250, true);
    this.scrollHandler = () => {
      this.requestCaptureSoon();
    };
    this.activityHandler = () => {
      this.lastActivity = performance.now();
      if (this.renderer)
        this.renderer.lastActivity = this.lastActivity / 1e3;
      if (this.settings.idlePlaybackEnabled) {
        this.setPlaybackSuspended(true);
        this.scheduleIdleResume();
      }
    };
  }
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new BlackHoleSettingsTab(this.app, this));
    this.addRibbonIcon("circle-dot", this.t("ribbon.toggle"), () => {
      this.enabled = !this.enabled;
      if (this.enabled)
        this.start();
      else
        this.stop();
      new import_obsidian2.Notice(this.enabled ? this.t("notice.enabled") : this.t("notice.disabled"));
    });
    this.app.workspace.onLayoutReady(() => {
      if (this.enabled)
        this.start();
    });
  }
  onunload() {
    this.stop();
  }
  start() {
    if (this.renderer)
      return;
    try {
      this.startInternal();
    } catch (e) {
      console.error("BlackHole: failed to start.", e);
      new import_obsidian2.Notice(this.t("notice.startFailed"));
      this.stop();
      this.enabled = false;
    }
  }
  startInternal() {
    const canvas = document.createElement("canvas");
    canvas.className = "blackhole-canvas";
    this.canvas = canvas;
    const host = document.querySelector(".app-container") ?? document.body;
    host.appendChild(canvas);
    this.renderer = new BlackHoleRenderer(canvas, this.toShaderParams());
    if (!this.renderer.init()) {
      console.error("BlackHole: WebGL2 not available");
      new import_obsidian2.Notice(this.t("notice.requireWebgl2"));
      canvas.remove();
      this.renderer = null;
      this.canvas = null;
      return;
    }
    const capture = new WorkspaceCapture();
    capture.setElement(this.findCaptureTarget());
    capture.onCapture = (canvas2) => {
      if (this.capture !== capture || !this.renderer)
        return;
      this.renderer.updateTexture(canvas2);
    };
    this.capture = capture;
    const blank = WorkspaceCapture.blankCanvas(window.innerWidth, window.innerHeight);
    this.renderer.updateTexture(blank);
    this.lastActivity = performance.now();
    if (this.renderer.softwareRenderer && this.settings.renderScale >= 0.5) {
      new import_obsidian2.Notice(this.t("notice.softwareReduced"));
    }
    this.applyRuntimeSettings();
    this.capture.capture(performance.now());
    this.renderer.sizeMode = this.settings.sizeMode;
    this.renderer.lastActivity = this.lastActivity / 1e3;
    this.renderer.tokenLevel = this.computeTokenLevel();
    this.renderer.start();
    this.syncPlaybackGate();
    document.addEventListener("keydown", this.activityHandler);
    document.addEventListener("mousedown", this.activityHandler);
    document.addEventListener("touchstart", this.activityHandler);
    document.addEventListener("wheel", this.activityHandler, { passive: true });
    this.captureIntervalId = window.setInterval(() => {
      try {
        if (!this.renderer || !this.capture || this.playbackSuspended)
          return;
        this.capture.capture(performance.now());
      } catch (e) {
        console.error("BlackHole: capture tick failed.", e);
      }
    }, 1e3);
    this.metricIntervalId = window.setInterval(() => {
      try {
        if (!this.renderer || this.settings.sizeMode !== 1 || this.playbackSuspended)
          return;
        this.renderer.tokenLevel = this.computeTokenLevel();
      } catch (e) {
        console.error("BlackHole: metric tick failed.", e);
      }
    }, 1e3);
    const refresh = () => {
      try {
        this.capture?.setElement(this.findCaptureTarget());
        this.capture?.requestSoon();
      } catch (e) {
        console.error("BlackHole: capture-target refresh failed.", e);
      }
    };
    this.leafChangeRef = this.app.workspace.on("active-leaf-change", refresh);
    this.layoutChangeRef = this.app.workspace.on("layout-change", refresh);
    document.addEventListener("scroll", this.scrollHandler, { capture: true, passive: true });
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
    window.clearTimeout(this.idleResumeTimeoutId);
    this.captureIntervalId = 0;
    this.metricIntervalId = 0;
    this.idleResumeTimeoutId = 0;
    this.playbackSuspended = false;
    document.removeEventListener("keydown", this.activityHandler);
    document.removeEventListener("mousedown", this.activityHandler);
    document.removeEventListener("touchstart", this.activityHandler);
    document.removeEventListener("wheel", this.activityHandler);
    document.removeEventListener("scroll", this.scrollHandler, { capture: true });
    if (this.leafChangeRef) {
      this.app.workspace.offref(this.leafChangeRef);
      this.leafChangeRef = null;
    }
    if (this.layoutChangeRef) {
      this.app.workspace.offref(this.layoutChangeRef);
      this.layoutChangeRef = null;
    }
  }
  onModeChange() {
    if (!this.renderer)
      return;
    this.renderer.sizeMode = this.settings.sizeMode;
    this.renderer.tokenLevel = this.computeTokenLevel();
    this.capture?.reset();
  }
  /**
   * Tunable params are baked into the shader as compile-time consts, so changing
   * one requires a recompile. Debounced so dragging a slider doesn't recompile
   * the shader on every tick — only ~once the user pauses.
   */
  onParamsChange() {
    this.recompileSoon();
  }
  /** Apply non-shader runtime settings (render scale, capture cadence). */
  applyRuntimeSettings() {
    if (this.renderer) {
      this.renderer.captureEnabled = this.settings.captureEnabled;
      const effectiveScale = this.renderer.softwareRenderer ? Math.min(this.settings.renderScale, MAX_RENDER_SCALE_SOFTWARE) : Math.min(this.settings.renderScale, MAX_RENDER_SCALE);
      this.renderer.setRenderScale(effectiveScale);
    }
    this.capture?.setOptions({
      enabled: this.settings.captureEnabled,
      intervalMs: Math.max(this.settings.captureIntervalMs, 2500)
    });
    this.syncPlaybackGate();
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async loadSettings() {
    const data = await this.loadData();
    if (data)
      this.settings = { ...DEFAULT_SETTINGS, ...data };
    const changed = this.normalizeSettings();
    if (changed)
      await this.saveSettings();
  }
  t(key) {
    return t(this.settings.language, key);
  }
  toShaderParams() {
    return {
      holeRadius: Math.min(this.settings.holeRadius, MAX_HOLE_RADIUS),
      lensDepth: this.settings.lensDepth,
      starGain: this.settings.starGain,
      diskInner: this.settings.diskInner,
      diskOuter: Math.min(this.settings.diskOuter, MAX_DISK_OUTER),
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
      tokenAreaMin: Math.min(this.settings.tokenAreaMin, MAX_TOKEN_AREA_MIN),
      tokenAreaMax: Math.min(this.settings.tokenAreaMax, MAX_TOKEN_AREA_MAX),
      tokenHomeX: this.settings.tokenHomeX,
      tokenHomeY: this.settings.tokenHomeY,
      tokenEase: this.settings.tokenEase,
      tokenReach: this.settings.tokenReach,
      tokenCalm: this.settings.tokenCalm,
      tokenRush: this.settings.tokenRush,
      nSteps: Math.min(this.settings.nSteps, MAX_SHADER_STEPS),
      workPeriodMin: this.settings.workPeriodMin,
      breakMin: this.settings.breakMin,
      idleFadeSec: this.settings.idleFadeSec,
      tokenGlideMin: 0.3,
      tokenGlideMax: 1.5,
      tokenGlideRate: 10
    };
  }
  normalizeSettings() {
    const before = JSON.stringify(this.settings);
    this.settings.holeRadius = Math.min(this.settings.holeRadius, MAX_HOLE_RADIUS);
    this.settings.tokenAreaMin = Math.min(this.settings.tokenAreaMin, MAX_TOKEN_AREA_MIN);
    this.settings.tokenAreaMax = Math.min(this.settings.tokenAreaMax, MAX_TOKEN_AREA_MAX);
    this.settings.diskOuter = Math.min(this.settings.diskOuter, MAX_DISK_OUTER);
    this.settings.nSteps = Math.min(this.settings.nSteps, MAX_SHADER_STEPS);
    this.settings.renderScale = Math.min(this.settings.renderScale, MAX_RENDER_SCALE);
    this.settings.captureIntervalMs = Math.max(this.settings.captureIntervalMs, 2500);
    this.settings.idlePlaybackDelaySec = Math.max(this.settings.idlePlaybackDelaySec, 5);
    return JSON.stringify(this.settings) !== before;
  }
  scheduleIdleResume() {
    window.clearTimeout(this.idleResumeTimeoutId);
    if (!this.settings.idlePlaybackEnabled)
      return;
    const delayMs = this.settings.idlePlaybackDelaySec * 1e3;
    this.idleResumeTimeoutId = window.setTimeout(() => {
      const idleFor = performance.now() - this.lastActivity;
      if (idleFor >= delayMs)
        this.setPlaybackSuspended(false);
    }, delayMs);
  }
  syncPlaybackGate() {
    if (!this.renderer)
      return;
    if (!this.settings.idlePlaybackEnabled) {
      window.clearTimeout(this.idleResumeTimeoutId);
      this.setPlaybackSuspended(false);
      return;
    }
    const delayMs = this.settings.idlePlaybackDelaySec * 1e3;
    const idleFor = performance.now() - this.lastActivity;
    if (idleFor >= delayMs)
      this.setPlaybackSuspended(false);
    else {
      this.setPlaybackSuspended(true);
      this.scheduleIdleResume();
    }
  }
  setPlaybackSuspended(suspended) {
    if (this.playbackSuspended === suspended)
      return;
    this.playbackSuspended = suspended;
    this.canvas?.classList.toggle("hidden", suspended);
    if (!this.renderer)
      return;
    if (suspended) {
      this.renderer.stop();
      return;
    }
    this.capture?.requestSoon();
    this.renderer.start();
  }
  computeTokenLevel() {
    if (this.settings.sizeMode !== 1)
      return -1;
    try {
      switch (this.settings.tokenMetric) {
        case "word-count": {
          const mdView = this.app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView);
          if (!mdView)
            return -1;
          const text = mdView.editor?.getValue() ?? "";
          const words = text.match(/\S+/g)?.length ?? 0;
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
    } catch (e) {
      console.error("BlackHole: token-metric computation failed.", e);
      return -1;
    }
  }
  findCaptureTarget() {
    return document.querySelector(".app-container") ?? document.querySelector(".workspace") ?? document.body;
  }
};
/*! Bundled license information:

dom-to-image-more/dist/dom-to-image-more.min.js:
  (*! dom-to-image-more v3.10.0 2026-06-12 05:29:50 UTC *)
*/
