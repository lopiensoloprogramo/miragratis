import ReactGA from "react-ga4";

const GA_ID = "G-TQQV69853R"; // <-- Tu Measurement ID

export const initAnalytics = () => {
  ReactGA.initialize(GA_ID);
};

export const trackPageView = (path: string) => {
  ReactGA.send({
    hitType: "pageview",
    page: path,
  });
};