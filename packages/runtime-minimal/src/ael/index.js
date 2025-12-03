"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryAEL = void 0;
/**
 * InMemoryAEL
 *
 * Reference implementation used for tests and examples.
 * It does NOT call any real external systems.
 */
class InMemoryAEL {
    async executeAction(params) {
        // For now, simply echo the input as output.
        return {
            output: params.input,
            events: []
        };
    }
}
exports.InMemoryAEL = InMemoryAEL;
