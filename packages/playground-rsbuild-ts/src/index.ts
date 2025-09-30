import "./index.css";

import { getLibRsLib } from "lib-rslib";
import { getLibTsdown } from "lib-tsdown";
import { getLibTsup } from "lib-tsup";

const rootEl = document.querySelector("#root");
if (rootEl) {
  rootEl.innerHTML = `
  <div class="content">

    <p>${getLibRsLib()}</p>
    <p>${getLibTsdown()}</p>
    <p>${getLibTsup()}</p>
  </div>
`;
}
