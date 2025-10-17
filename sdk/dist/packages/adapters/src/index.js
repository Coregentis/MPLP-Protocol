"use strict";
/**
 * @fileoverview MPLP Platform Adapters - Main exports
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediumAdapter = exports.RedditAdapter = exports.SlackAdapter = exports.DiscordAdapter = exports.GitHubAdapter = exports.LinkedInAdapter = exports.TwitterAdapter = exports.AdapterManager = exports.AdapterFactory = exports.BaseAdapter = void 0;
// Core exports
__exportStar(require("./core/types"), exports);
var BaseAdapter_1 = require("./core/BaseAdapter");
Object.defineProperty(exports, "BaseAdapter", { enumerable: true, get: function () { return BaseAdapter_1.BaseAdapter; } });
var AdapterFactory_1 = require("./core/AdapterFactory");
Object.defineProperty(exports, "AdapterFactory", { enumerable: true, get: function () { return AdapterFactory_1.AdapterFactory; } });
var AdapterManager_1 = require("./core/AdapterManager");
Object.defineProperty(exports, "AdapterManager", { enumerable: true, get: function () { return AdapterManager_1.AdapterManager; } });
// Platform adapters
var TwitterAdapter_1 = require("./platforms/twitter/TwitterAdapter");
Object.defineProperty(exports, "TwitterAdapter", { enumerable: true, get: function () { return TwitterAdapter_1.TwitterAdapter; } });
var LinkedInAdapter_1 = require("./platforms/linkedin/LinkedInAdapter");
Object.defineProperty(exports, "LinkedInAdapter", { enumerable: true, get: function () { return LinkedInAdapter_1.LinkedInAdapter; } });
var GitHubAdapter_1 = require("./platforms/github/GitHubAdapter");
Object.defineProperty(exports, "GitHubAdapter", { enumerable: true, get: function () { return GitHubAdapter_1.GitHubAdapter; } });
var DiscordAdapter_1 = require("./platforms/discord/DiscordAdapter");
Object.defineProperty(exports, "DiscordAdapter", { enumerable: true, get: function () { return DiscordAdapter_1.DiscordAdapter; } });
var SlackAdapter_1 = require("./platforms/slack/SlackAdapter");
Object.defineProperty(exports, "SlackAdapter", { enumerable: true, get: function () { return SlackAdapter_1.SlackAdapter; } });
var RedditAdapter_1 = require("./platforms/reddit/RedditAdapter");
Object.defineProperty(exports, "RedditAdapter", { enumerable: true, get: function () { return RedditAdapter_1.RedditAdapter; } });
var MediumAdapter_1 = require("./platforms/medium/MediumAdapter");
Object.defineProperty(exports, "MediumAdapter", { enumerable: true, get: function () { return MediumAdapter_1.MediumAdapter; } });
// Utilities
__exportStar(require("./utils"), exports);
//# sourceMappingURL=index.js.map