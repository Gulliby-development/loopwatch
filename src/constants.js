// Fixed values of loopwatch: the limits, the defaults of the three detectors and the usage text.
export const MAX_STEPS = 200;
export const MAX_PERIOD = 4;
export const DEFAULTS = { repeat: 3, cycles: 3, fails: 3 };
export const OPTION_NAMES = ["repeat", "cycles", "fails"];
export const USAGE =
  "usage: loopwatch scan [OPTIONS] FILE\n" +
  "       loopwatch check [OPTIONS] FILE\n" +
  "       loopwatch stats FILE\n" +
  "options: --repeat N, --cycles N, --fails N (whole numbers from 2 to 50)\n";
