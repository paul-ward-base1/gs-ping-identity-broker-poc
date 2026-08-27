import classnames from "classnames";

import { withNaming } from "@bem-react/classname";

export const cn = withNaming({ n: "gs-", e: "__", m: "--", v: "-" });
export const cx = classnames;
