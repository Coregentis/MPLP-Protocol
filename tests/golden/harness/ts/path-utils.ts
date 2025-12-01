/**
 * Copyright 2025 邦士（北京）网络科技有限公司.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// tests/golden/harness/ts/path-utils.ts

export type PathToken = { type: "prop"; key: string }
    | { type: "index"; index: number }
    | { type: "wildcard" };

function parsePath(path: string): PathToken[] {
    const tokens: PathToken[] = [];
    let i = 0;
    const n = path.length;
    let current = "";

    const pushProp = () => {
        if (current.length > 0) {
            tokens.push({ type: "prop", key: current });
            current = "";
        }
    };

    while (i < n) {
        const ch = path[i];

        if (ch === ".") {
            // segment separator
            pushProp();
            i++;
            continue;
        }

        if (ch === "[") {
            // flush property before bracket
            pushProp();
            const end = path.indexOf("]", i);
            if (end === -1) {
                throw new Error(`Invalid path, missing ] in: ${path}`);
            }
            const inside = path.slice(i + 1, end).trim();
            if (inside === "*") {
                tokens.push({ type: "wildcard" });
            } else {
                const idx = Number(inside);
                if (!Number.isInteger(idx)) {
                    throw new Error(`Invalid array index in path: ${path}`);
                }
                tokens.push({ type: "index", index: idx });
            }
            i = end + 1;
            continue;
        }

        // normal char for property name
        current += ch;
        i++;
    }

    pushProp();
    return tokens;
}

/**
 * 遍历路径，返回所有匹配到的节点（带实际 path）。
 * 支持:
 *  - foo.bar
 *  - items[0].id
 *  - items[*].id
 */
export function getValueNodesByPath(
    root: any,
    path: string
): Array<{ path: string; value: any }> {
    const tokens = parsePath(path);
    // 每一步都是一组候选节点
    // 节点 = { path, value }
    let nodes: Array<{ path: string; value: any }> = [{ path: "", value: root }];

    for (const token of tokens) {
        const next: Array<{ path: string; value: any }> = [];

        for (const node of nodes) {
            const value = node.value;

            if (value === null || value === undefined) {
                continue;
            }

            if (token.type === "prop") {
                if (typeof value === "object" && !Array.isArray(value) && token.key in value) {
                    const newPath = node.path
                        ? `${node.path}.${token.key}`
                        : token.key;
                    next.push({ path: newPath, value: (value as any)[token.key] });
                }
            } else if (token.type === "index") {
                if (Array.isArray(value) && value.length > token.index) {
                    const newPath = `${node.path}[${token.index}]`;
                    next.push({ path: newPath, value: value[token.index] });
                }
            } else if (token.type === "wildcard") {
                if (Array.isArray(value)) {
                    for (let i = 0; i < value.length; i++) {
                        const newPath = `${node.path}[${i}]`;
                        next.push({ path: newPath, value: value[i] });
                    }
                }
            }
        }

        nodes = next;
    }

    return nodes;
}
