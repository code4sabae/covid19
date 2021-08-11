import { say } from "https://taisukef.github.io/say.js/say.js";

const voiceOver = (data) => {
  //say("福井県の現在患者数は3384人、対策病床数は3395、その割合は33%です");
  say(data);
};

export { voiceOver };
