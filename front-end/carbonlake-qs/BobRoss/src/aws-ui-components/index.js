import InputControlled from "@amzn/awsui-components-react/polaris/input";
import RadioGroupControlled from "@amzn/awsui-components-react/polaris/radio-group";
import TextareaControlled from "@amzn/awsui-components-react/polaris/textarea";
import SelectControlled from "@amzn/awsui-components-react/polaris/select";
import MultiselectControlled from "@amzn/awsui-components-react/polaris/multiselect";
import TilesControlled from "@amzn/awsui-components-react/polaris/tiles";
import CheckboxControlled from "@amzn/awsui-components-react/polaris/checkbox";
import AppLayoutControlled from "@amzn/awsui-components-react/polaris/app-layout";

import uncontrol from "./uncontrol.jsx";

export * from "@amzn/awsui-components-react";

export const Input = uncontrol(InputControlled, "onChange", "value");
export const RadioGroup = uncontrol(RadioGroupControlled, "onChange", "value");
export const Textarea = uncontrol(TextareaControlled, "onChange", "value");
export const Select = uncontrol(SelectControlled, "onChange", "selectedOption");
export const Multiselect = uncontrol(
  MultiselectControlled,
  "onChange",
  "selectedOptions"
);
export const Tiles = uncontrol(TilesControlled, "onChange", "value");
export const Checkbox = uncontrol(CheckboxControlled, "onChange", "checked");
export const AppLayout = uncontrol(
  AppLayoutControlled,
  "onNavigationChange",
  "navigationOpen",
  "open"
);
export { default as AttributeEditor } from "./uncontrolled-attribute-editor";
