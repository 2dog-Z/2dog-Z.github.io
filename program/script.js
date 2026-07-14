const TIER_DEFINITIONS = [
  { id: "lottery", label: "Lottery | 彩票" },
  { id: "reach", label: "Reach | 冲刺" },
  { id: "match", label: "Match | 主申" },
  { id: "safety", label: "Safety | 保底" }
];

const SCHOOL_OPTIONS = [
  { id: "princeton", short: "Princeton", cn: "普林斯顿大学", en: "Princeton University", domain: "www.princeton.edu", qs: 22, usNews: 16, cs: 29 },
  { id: "mit", short: "MIT", cn: "麻省理工学院", en: "Massachusetts Institute of Technology", domain: "www.mit.edu", qs: 1, usNews: 2, cs: 9 },
  { id: "harvard", short: "Harvard", cn: "哈佛大学", en: "Harvard University", domain: "www.harvard.edu", qs: 4, usNews: 1, cs: 61 },
  { id: "stanford", short: "Stanford", cn: "斯坦福大学", en: "Stanford University", domain: "www.stanford.edu", qs: 6, usNews: 3, cs: 17 },
  { id: "oxford", short: "Oxford", cn: "牛津大学", en: "University of Oxford", domain: "www.ox.ac.uk", qs: 3, usNews: 4, cs: 91 },
  { id: "cambridge", short: "Cambridge", cn: "剑桥大学", en: "University of Cambridge", domain: "www.cam.ac.uk", qs: 5, usNews: 5, cs: 72 },
  { id: "yale", short: "Yale", cn: "耶鲁大学", en: "Yale University", domain: "www.yale.edu", qs: 23, usNews: 9, cs: 65 },
  { id: "imperial", short: "Imperial", cn: "帝国理工学院", en: "Imperial College London", domain: "www.imperial.ac.uk", qs: 2, usNews: 11, cs: 81 },
  { id: "caltech", short: "Caltech", cn: "加州理工学院", en: "California Institute of Technology", domain: "www.caltech.edu", qs: 10, usNews: 23, cs: 206 },
  { id: "duke", short: "Duke", cn: "杜克大学", en: "Duke University", domain: "duke.edu", qs: 61, usNews: 27, cs: 51 },
  { id: "brown", short: "Brown", cn: "布朗大学", en: "Brown University", domain: "www.brown.edu", qs: 79, usNews: 150, cs: 87 },
  { id: "eth", short: "ETH Zurich", cn: "苏黎世联邦理工学院", en: "ETH Zurich", domain: "ethz.ch", qs: 7, usNews: 35, cs: 8 },
  { id: "nus", short: "NUS", cn: "新加坡国立大学", en: "National University of Singapore", domain: "www.nus.edu.sg", qs: 8, usNews: 20, cs: 18 },
  { id: "ucl", short: "UCL", cn: "伦敦大学学院", en: "University College London", domain: "www.ucl.ac.uk", qs: 9, usNews: 7, cs: 81 },
  { id: "jhu", short: "JHU", cn: "约翰斯霍普金斯大学", en: "Johns Hopkins University", domain: "www.jhu.edu", qs: 32, usNews: 14, cs: 65 },
  { id: "northwestern", short: "Northwestern", cn: "西北大学", en: "Northwestern University", domain: "www.northwestern.edu", qs: 50, usNews: 24, cs: 45 },
  { id: "columbia", short: "Columbia", cn: "哥伦比亚大学", en: "Columbia University", domain: "www.columbia.edu", qs: 34, usNews: 10, cs: 36 },
  { id: "cornell", short: "Cornell", cn: "康奈尔大学", en: "Cornell University", domain: "www.cornell.edu", qs: 16, usNews: 16, cs: 15 },
  { id: "cornelltech", short: "Cornell Tech", cn: "康奈尔大学Tech校区", en: "Cornell University Tech Campus", domain: "tech.cornell.edu", qs: 16, usNews: 16, cs: 15 },
  { id: "upenn", short: "UPenn", cn: "宾夕法尼亚大学", en: "University of Pennsylvania", domain: "www.upenn.edu", qs: 11, usNews: 15, cs: 31 },
  { id: "chicago", short: "UChicago", cn: "芝加哥大学", en: "University of Chicago", domain: "www.uchicago.edu", qs: 21, usNews: 26, cs: 45 },
  { id: "berkeley", short: "UC Berkeley", cn: "加州大学伯克利分校", en: "University of California, Berkeley", domain: "www.berkeley.edu", qs: 12, usNews: 6, cs: 13 },
  { id: "ntu", short: "NTU", cn: "南洋理工大学", en: "Nanyang Technological University, Singapore", domain: "www.ntu.edu.sg", qs: 15, usNews: 28, cs: 19 },
  { id: "epfl", short: "EPFL", cn: "洛桑联邦理工学院", en: "Ecole Polytechnique Federale de Lausanne", domain: "www.epfl.ch", qs: 26, usNews: 86, cs: 31 },
  { id: "toronto", short: "Toronto", cn: "多伦多大学", en: "University of Toronto", domain: "www.utoronto.ca", qs: 25, usNews: 16, cs: 21 },
  { id: "ucla", short: "UCLA", cn: "加州大学洛杉矶分校", en: "University of California, Los Angeles", domain: "www.ucla.edu", qs: 42, usNews: 13, cs: 37 },
  { id: "rice", short: "Rice", cn: "莱斯大学", en: "Rice University", domain: "www.rice.edu", qs: 141, usNews: 219, cs: 72 },
  { id: "dartmouth", short: "Dartmouth", cn: "达特茅斯学院", en: "Dartmouth College", domain: "home.dartmouth.edu", qs: 243, usNews: 326, cs: 156 },
  { id: "michigan", short: "UMich", cn: "密歇根大学安娜堡分校", en: "University of Michigan, Ann Arbor", domain: "umich.edu", qs: 44, usNews: 21, cs: 10 },
  { id: "cmu", short: "CMU", cn: "卡内基梅隆大学", en: "Carnegie Mellon University", domain: "www.cmu.edu", qs: 58, usNews: 126, cs: 1 },
  { id: "ucsd", short: "UCSD", cn: "加州大学圣地亚哥分校", en: "University of California, San Diego", domain: "ucsd.edu", qs: 72, usNews: 21, cs: 4 },
  { id: "usc", short: "USC", cn: "南加州大学", en: "University of Southern California", domain: "www.usc.edu", qs: 125, usNews: 77, cs: 39 },
  { id: "utexas", short: "UT Austin", cn: "得克萨斯大学奥斯汀分校", en: "The University of Texas at Austin", domain: "www.utexas.edu", qs: 66, usNews: 65, cs: 24 },
  { id: "gatech", short: "Georgia Tech", cn: "佐治亚理工学院", en: "Georgia Institute of Technology", domain: "www.gatech.edu", qs: 114, usNews: 79, cs: 6 },
  { id: "uiuc", short: "UIUC", cn: "伊利诺伊大学香槟分校", en: "University of Illinois Urbana-Champaign", domain: "illinois.edu", qs: 69, usNews: 109, cs: 3 },
  { id: "tum", short: "TUM", cn: "慕尼黑工业大学", en: "Technical University of Munich", domain: "www.tum.de", qs: 28, usNews: 79, cs: 41 },
  { id: "hkust", short: "HKUST", cn: "香港科技大学", en: "Hong Kong University of Science and Technology", domain: "hkust.edu.hk", qs: 47, usNews: 101, cs: 22 },
  { id: "hku", short: "HKU", cn: "香港大学", en: "The University of Hong Kong", domain: "www.hku.hk", qs: 17, usNews: 44, cs: 65 },
  { id: "edinburgh", short: "Edinburgh", cn: "爱丁堡大学", en: "University of Edinburgh", domain: "www.ed.ac.uk", qs: 27, usNews: 39, cs: 37 },
  { id: "tudelft", short: "TU Delft", cn: "代尔夫特理工大学", en: "Delft University of Technology", domain: "www.tudelft.nl", qs: 49, usNews: 191, cs: 65 },
  { id: "waterloo", short: "Waterloo", cn: "滑铁卢大学", en: "University of Waterloo", domain: "uwaterloo.ca", qs: 115, usNews: 197, cs: 28 },
  { id: "bu", short: "Boston U", cn: "波士顿大学", en: "Boston University", domain: "www.bu.edu", qs: 108, usNews: 86, cs: 58 },
  { id: "wisc", short: "UW-Madison", cn: "威斯康星大学麦迪逊分校", en: "University of Wisconsin-Madison", domain: "www.wisc.edu", qs: 116, usNews: 72, cs: 27 },
  { id: "uw", short: "UW", cn: "华盛顿大学西雅图分校", en: "University of Washington", domain: "www.washington.edu", qs: 76, usNews: 8, cs: 11 },
  { id: "nyu", short: "NYU", cn: "纽约大学", en: "New York University", domain: "www.nyu.edu", qs: 43, usNews: 32, cs: 24 },
  { id: "tamu", short: "Texas A&M", cn: "德州农工大学", en: "Texas A&M University", domain: "www.tamu.edu", qs: 154, usNews: 187, cs: 58 },
  { id: "neu", short: "Northeastern", cn: "东北大学", en: "Northeastern University", domain: "www.northeastern.edu", qs: 396, usNews: 220, cs: 16 }
];

const STATUS_DEFINITIONS = {
  draft: { id: "draft", label: "Draft", shortLabel: "Draft", colorClass: "is-gray" },
  applied: { id: "applied", label: "Applied ✉️", shortLabel: "Applied ✉️", colorClass: "is-green" },
  interview: { id: "interview", label: "Interview 👨🏻‍💼", shortLabel: "Interview 👨🏻‍💼", colorClass: "is-green" },
  waitlist: { id: "waitlist", label: "Waitlist ⌛️", shortLabel: "Waitlist ⌛️", colorClass: "is-yellow" },
  admitted: { id: "admitted", label: "Admitted ✅", shortLabel: "Admitted ✅", colorClass: "is-green" },
  reject: { id: "reject", label: "Rejected ❌", shortLabel: "Rejected ❌", colorClass: "is-red" }
};

const TERMINAL_STATUSES = new Set(["admitted", "reject"]);

const DEFAULT_PROGRAMS = [
  {
    id: createId(),
    tierId: "lottery",
    shortName: "Loading",
    schoolId: "mit",
    cnName: "加载中",
    enName: "Loading Content.",
    statusHistory: []
  },
  {
    id: createId(),
    tierId: "reach",
    shortName: "Loading",
    schoolId: "mit",
    cnName: "加载中",
    enName: "Loading Content.",
    statusHistory: []
  },
  {
    id: createId(),
    tierId: "match",
    shortName: "Loading",
    schoolId: "mit",
    cnName: "加载中",
    enName: "Loading Content.",
    statusHistory: []
  },
  {
    id: createId(),
    tierId: "safety",
    shortName: "Loading",
    schoolId: "mit",
    cnName: "加载中",
    enName: "Loading Content.",
    statusHistory: []
  },

];

const WORKER_URL = "https://schoolprogram.2dogz.net"; // 替换为你的 Cloudflare Worker 网址

// ==== 大学 Logo 内联缓存（运行 download_logos.sh 生成，替换下方内容） ====
// 格式: WebP Base64 data URI，48×48，首次加载零网络请求
const LOGO_MAP = {
  "princeton": "data:image/webp;base64,UklGRhwEAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSF8BAAABkCsAkCFZdbZtZ4xsRFZkW5Hv2bZtO7NtI7Jtox6rq+v9QERMAHCHRYJsk10HzWRNQpwpajgi4ngDMTbz8K+L7YQkHcd/nkkVYBiz/DMSv66ON+JJHpkf6evmHZoz/OhXVPx+fGRumI+bb0TuiAxKN+K3V09efEHmry+evPqGOJQyEkWOpkyUMf5/GiNjDKVPxjBKvYwOSpGMEkrUdwk/kig+ryW8D6SYX5dww5oC2yTsAPIg/KEdR9MyUWAhze2pvlfeNNiub7+BQpu+blAMea/rU6iKwXZd+w1VoFxXPSg73NHzwEUNhusZD4w+z3W8DuSA8TqmA6v3I77nATzQzTcYmK0ucF2z44L0rzzfMoHdYCrPHAM+sDnDcckBdEa+UHsTDXqLv6v8qAbdA1VGgXaDObRFRvrAZDllvRlINFv9r81WINN04d9WWIBUo0l/zDAGwe2fvnSC7Oom4AYAVlA4IJYCAADQDwCdASowADAAPm0skUakIiGhLjgLMIANiWwA0IcOM7Cg9qu+WTP8yWABzi/SA8wHn/+gD0AP57/kOsA9ADyyvYW/aT0gLua8CnAFuqenPYA8oz2AMCRJ4QY+p8pQFQemq4exoo1b4WEIYMZIYdxWULkdPpHgPA25G5i2wREL/8Mlr9WK0YAA/v+5ZZtjcZW52ConMzMP14Hyaq7/neuh07S8K/opu0L+q53A/nhv+4Qza8ET0iXz8EvaAPMmw8yYEorf5vZotNSrPw/662ojzfjtpv8BSVRV30YtfgHo5iHiytMoDoFWajEpHNCeNMNJfeBW8dJYpu/pJtiOd1pP3t3JTOKefOKQLPrR0vjRue1aoqM/onS/zFzFfZHllAvseLaJxZD+oMIRgxk4BRSalPvnfj9EBpHsWWMfsg2cYD+N5sD4kxpuCqRg8ZwbqV+7pTqsqRSMH5BzuCkuQ3W4a80QLP2LfvyzfiEg/HGeCSerqtMLfPXPG/ghwLQslrYPsKRWUFZe3LZqOu8PIdUp+TzqjD3h5ai86uXubbKedICv/36vJLj9mZTn96Lut4FDzZBiaS3xPM/F85KsPeJyf+NTCIhKOuvsf6j+ujG6Xo2PGHLbQdEkZImMP/6zkT6vBHpLaBocfGeZgX4ljG3irn/1a4R/yS63ei1r8GKz75BvV2NKgNg+kmURDBKdGExWqdzVCkZSPv1+1+2yWnohPufeYLMe+RZmFUqNYZyiDpjQFBn1PC9rR0EAbqqSxs3t02KIt3Wtf0ujPIpDjISLh/EvfMam1zw6LG3mfrC8wXTjcpA6r92oZJMYIOmzbXaeQfXKfJ+z+2S1AhDdtfF8f+iXf9wGk97wRuVdWk0Z6jpInMMAAA==",
  "mit": "data:image/webp;base64,UklGRnYCAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSHUBAAABkGzbtmlX66TZtl22XeYXpGbbKt78wk05qXu3/Iid964Z5zTth4O91xdExASAWSE2q2378CIgyYHL452u7FgBuIZWzh/ZqGHH0XJNKIcs66NITYvPewWsEsZeKePXmQQmTUSkzCXSwWDgl0I5KrYhM6Fjr5Tz11i4sTEf5e6bMzTwShG+DRpo+kVRept0EoiCQyXpWmMiRSouaGS9UrRvOQAQaqWI90MBKh8xuSpBWBAxSQtC7BFFfZScZcNlK2+nyLu3sVkOsZELbNcBbEEJmyyjC2ALXmK7OcZ2vo3N0oWtL9uBy1ERe4TrKFlYFjFJSyFQ84zJXQMQasV0EAoABa943orh/xkJi7QKmglEwaGSdC3osOHwtQs6MPiF4WsSjI56+XnnwHDY7Buvr9lIYwCDXpWH6psE841EZCeRDmCZvvDK6m0tXWACkLPvksxJ7oNiYB9aOX9kM+Y4Wq4JBa5Ccnm35ew6KMvBm/Pd/oqUEDALAFZQOCDaAAAAMAYAnQEqMAAwAD5tMpRHJCMiISq6qACADYlpAAdKBTnTkACxFqrpaHbFkqrPUaCIYj9n5LWcaKkQAAD+/50Y/+4L/3Kf2mt/5bi/9JH/WOI+QZjL3xnn0X+IhY/lcv/ygNd/gLLLyGool58YvxEV9J0+UKgihvzkjxJQABu0u69+7HlE3fyqP9rUWNL/BXgrxT6BX9hmgDJj/faYELxQKj0PpmrofZpXp//a8f/XqEXltBhtmowZrzlLJjpRp+r7QvSw7wXY6JhrucqH/JqC/1Uioh/kigAAAAA=",
  "harvard": "data:image/webp;base64,UklGRqgDAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSNsAAAABgGJt2zLlGZ9JMw1318gCoLlbsgQLIM4CkMQC3Gnu7u4aOdNwd7f3fX+8RcQE4Neo1qhFNWqSrn5GuE5HMWw9Cm/oSatSy/8+2kWlYUhqVk1qlOoFuUCqkpYjZaWF3QvF0iw2mRN3GppkxjUMeTJWMHqeSlyFcqBFolfNkiiRBFbTEt+sgQeZfAlgNkxxtai5EH7DcxAA/hKeXAia5zjKVRII3aENmyEbeU5ZcYZ0xuXH1rwhn3rykVlPKDFi+702OyjTq+uNh2IjlKrP33t8tKVCyX6ltR74IwQAVlA4IKYCAACwDgCdASowADAAPm0yk0ckIyGhJytogA2JbACnR7RIBzKvQUNnpy6gG8PegB0qnkzUvp8Vj15hrdssV2uLMS/r/oYZw3o32Buir6AC8MXxTaqQ0hj2lsca3o077ppsvNBvbtcDhwD3sARZP7YztHoi1HfUYcE2T0VUeF7MxAAA/v8a3fMb3/3RoyReqPOtTGj6cYJY+0J8/NINaUc62LgUkKPpq+sJU1h3XB+k+f8S+lwWJe7t1xFimYPAh/l+2Q2g46KCrxjXh9QhX12STBZeyR+b4RnQES8utQgrVpBk/fpVbpiewnp5oLtCO2nRDoZfieTj3HSduBJeqPruJJEvGvTS9zYJOHsntLSsqA9nvqwrvoBCatejO8zJZIntnHdbdaOGG0osMAsL2P/GUcBg0sNgMgtiFnMqgbx5fLZccn8Oa3GN1VvU1wLi9HDrlLyzNKYeSgYyFoQvK/oUfkBmUzzatO4aHF9+1tnRD9B5dBPMBBCN5gMgtijLlRSaG6m+q9i94usKV53iGt7vi8FkwwEb5Y1WZb/I8+shpssHSJx3AiV38vTou65+nvmKXne8Xv0W9uSW1+mWkI69llq3pF7woFQAMzHQL/5JQBbofq/JNQdSa1HpvM+2EwCw6Bji98FEs6KE9JqdUOADIsv2ymNboRZ5S5ARHVjcVb+ePU3N4D/zLeSigsqxMgH2bhL4nduNAL86hF0PoyM/Y732GdiEJ0W1dLXcvR5lZcxuiqPTtsTcHKvKZ7KDyxigipPwxAGyucubyc5B3dCBGNcNvaRKe2PX9Hbm/lnpD3cmTuyOfbHS7nPyFtkGMB8CkgW/nddzDtoX41SiqO9hD7l8TqBUfEzdfr7grFy6jUwT1yfTkoO0dSyvIM3VT9/xZKl1zFIgAAA=",
  "stanford": "data:image/webp;base64,UklGRhYFAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSJcBAAABkCLbtmpXa58wQ1/SAE4Us0QXS55RMUlQjE1IJ5gkKvh4qu7dex9oQUQ4cNs2kmyPpwmS7tl23kCM4Hl0Wzd/VYFM4inTmaCz9tUD9qkCpNCFtg/rxZdKVWDird3f1pPvtSCvoCe5vFUHzeR46LcN4Gcn3OnBfzaI381aA0+f20Buw2lHoViDflEErHKYeLYqfnACc4oXRDTnLx/LREEcky/JBxGwjbSQlzEce+J1Z2c35V4vQFqGyA9Xw4tdkFQ7iHzTv/ZnFpeWJ4qhU0wXlL4olmUgkWNBAC+LZb3DAkV8fgK/IbEwlUAOjLBzG6hybZhGwLgN5LRcbySYtRqIDV7Ckrw9YzXKuuPG6kK1KuYTgVCcdSSSTGuh69Rj/zYNjWO///sjjRTkFRUWFhVkZhSv/woxTVi/vWG8/ooU4DTCPuMI4+0zxoVYbUhwHDeIBDCYyGljENMcNReh2Eo6HBj8H+kchFH0HXzOum6B53gt71X6wNTtrY9akAI92fLu+RxSBa0XDtWFPecoidR5g+9zFNQKAgBWUDggWAMAAJARAJ0BKjAAMAA+bTKSR6QioaEnKSCADYlsAMrtQOE7I/7Uc9B6AN4z3iD9xrBN+2co4+57KT4DOQf3nJSvindu4O+Uz8K6ZB/cvNh/xPJT+Wf3T/ue4R/KP6j/yOA6/WBQAEqimLcHAUeLktdUk1tednMJ2bOE7PK73c+32Ygh8+e9v0XcNsUV05E94CNN+LcKMRcwAP7/nV3f1LqY03VcAR65BZ2kaXd6bZHvgPcYycXP9c9x34GoK6R8ZFqG7W6paZu85/z334IPrC7HGD//OaGUlrrXmSZAP0ofGn8TK3+fRa4RiKRPZ5+xMtmrNe/0kN8UPBGcR7veXh2+MZdXK0IZ5MOLge9J+bVfbQUAO5/gRN9siWYOGcwClVuVUB4XWp5oFKyYfdb3TYvy8KiHKgb6/JRPp4rP698PO9x1PC3t5slOT4b6YY14om/N8i51rKfhUOWTrW7g1KvfQI0g7J/ZQaGBHIcLtyF//W920cZrnf1fzPgkGI+t0u2r1vA89100KFlDXQiYo7ZudUdX46L2Cz5CS6yj7aSOP9c3lK9/1NvsI7yRVtFzVpxm5z128EbHmqXS6KGQbp8jBowoU6d0yPBXz2zg+tWgcd0IWUnvZTm24Oe8/ec4dW5ADVdHdI94ruGvij+mF/+5F2IbaBN6urbRsgTwx/cy/NT6u2LmfpNwhr/wIATsVrIYkxEAW7F31v13fIyNNHOjZ0/s0DhNxzC6dgb5GdOWAT3Pj5K6QjFx5FgI//LgSV1Dj43ljt/SLw2Hb+j4+6lvyHd6VgBqmilpcfov/akzhfXIJ4nFvUWCMX+iZ8RP6C2TvsML+z//S/9y6vOprcoGH2tfzCx3hVnQM4tBrCI+RKES7N6UTy/o2F9UULGxaYA6v5JTQS0lUPm1ND1QOXGXXvilT5W9wYeHOOaPCdm3MZfKUzF5II9ZvGgTwewD1/8X/jkfNi2YlfxiG8oO4GW2/qdFoVSj9uYRTIE7p+OB+JRsAespHwrneukd/6Y4/lmxI/faaRYaJwvPBIDMQFUV6g+FV61JMKsEOIliRwPUWcu3hZnGlHCDKLVdDe5f4Fbe2HB13ar+qEPyi+eM0GTCjUVQ+uPVoP4p0spygOlP9xKCRSP3OakAAAA=",
  "oxford": "data:image/webp;base64,UklGRrgAAABXRUJQVlA4IKwAAABQBQCdASowADAAPm0ylEekIqIhI4wAgA2JaQAFEASFPcVbKHeBEhqwNFT9f5us2AZvdIAA/vo6ulnvWGc09LP5s5BZ/QWekQ1uvwK7xfD21VTHlApVzwwvXuROG+wQe8229vOZ+STf12kP43dUrRZT3RmXdprZ875TDftqwFuw798irmm6WtptbzVl+vgweAyPd2lGJ65786lw+XuCoBVqtjv1DdUqI85aAAAA",
  "cambridge": "data:image/webp;base64,UklGRpIDAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSG8AAAABT0CQbZu6QRlm8IiIybvAbWtrT3OBBRAT5D6zQOyTF8ju8wTIC6R50aeP3k1E/yeA7W/Vkj+e/vbVvY4ReNVH98wdIH7rzhaAu581j425sNOLpguMBWw1JWJ/OMzS43CIJC/LLlKXZY4EbKUS5QoAVlA4IPwCAAAwEgCdASowADAAPm0wkUakIyGhLjgJmIANiWwAnTlBVH3WfVfyA/ID5BKZ/UfvZu7RHeqT8R92/uA/1/sA23PmA/Wb9dPaP6gD+k+aB7EXoAfsB6Yns7f67/Qevbfu7U/SmTdUT/pa88NCQ5DZaqogJtWPeig6m4kcCEuHIMxZa4eKAoza5JAO0w6H9SQ/hCnEVUeK7ay0hErwAP7vCn0TcQ6NnDTki48gu42eMcuZJ6YXc3gWOwXIPk9MEGDGtQydWv7KHYEyiYuldbiah0ShdetbIbqrTTw8cPz9DttBxNiwpSAi1y06MkQDhxDAXVb0/5KuPL3W+1f79pvbMWFNw3xyDpxPxtfR1p5WxjJj9cW2hIsZLZDdDbuWjOe4NCwby/zL3vK4Z0BRJWnpBhXZX9QL+WuoLYnRdAm7IKLyfTqrmg/KyTxTRoASrye1DF9BaLUa5UQcW6GsH0sPGjejxK7u+3Qmge+f86cUbMZHIHILtKiqdt3X/PM1umHq4RsOh2WGlqRUry6FKVBsjcFyAR3vIWAY9pF/i5iURfJS2322Ha8hr54kxHgv9wpPo4hXqKqf+mNMxvGGzkM6QPvVw+013uFQNPfPer72Lw16hC2+fr3XrcVNf/K/qsV4C3amkVgZ6xkFQ7z8nxGHRX9JGaKKkGP7b8UcWyit55FVxg3jk13dXE9GEMzA83Naml1ZORo3cQTTjA3n49Ee3rcG2Muc2q8P1xVLk2W32uhU/wmkESJRzBsP4lNyAF8f+Lw7srCfl+bvrvajkC31h+PsYpKnB4S6s1d3T1dUguZ2gVeOQUlbWRE4ZG/AvV1CByn+TGPKb+Wz+gUDnXVg3sgJ9k9EYdIiHxwB5EvVshpI3VMWA9Pu4YRrVa5/fO9WiZDXjx/Tu/30QDudBewNlaImwo0d6ibxWMf9d586b9J4xlcwo5G/HmtL3JbBUfUkx5DQ/4lLvdaMi16nUjfUtQ3PzzKizUTwBa+SIxtvOiJrF7faVRnCcZaw0AAAAA==",
  "yale": "data:image/webp;base64,UklGRvABAABXRUJQVlA4IOQBAACQCQCdASowADAAPm0ylEekIqIhI4z4gA2JZgCCOzifEeYEEZ5LHvPqNA6KzNy9L7970ADG1F0q6Ujsr/3q3cyLIG3WI6kKx2UhCakPx2zafWS0zLkAAP78//8Ki1EMgDTGf5J3BfBnaF/udfrxH8gSQ0jdUz3h9vcf91J8MLI1JOP///xvDnSmpVLfeYaHL//2GNbDi+bhSV0llo/KEIyoC2tv/ipHneV77Z3X/Gg8FR1+sVmmBVwCoQhj12Sg/TJ+FbmCnS4Op/4+Tj16dEG8i8tqC6DBMvjt0iLoNfFra1TfqgAKxrAQs5/ARL13mfit0/fdPbsEvpbW4ddJOBEIb1Qqdn2+QcyPAVdS58MU5QsWWdYwnuOh3INew9h/5yr2G0qOnHupn1lNgDVfUSDAW8wMR5skDWSp24la9W40bAGohgbH+S9N4cAvPrjbmD5eNexIHlBal/nuhtXxOdK+I/J0ouCEEgn8x4QOlUlunC6ck33fGFxebQthdrV4llOXs40D2y+5PViyLD7RouXqYGgKwAHZL6Y7/8hI9JuRpnwPR2fKtqztEsOS0yvLT+63IKQkG+tfXKnvqXUUSXfrqXzywBIarmvtM2+f2fcBBtO7h+IjynNcXhwTkZ+Xcj/5CzQA",
  "imperial": "data:image/webp;base64,UklGRloBAABXRUJQVlA4IE4BAADwCACdASowADAAPl0mjUWjoiEcbtwAOAXEtQBgiqCeByRvB6wH6gWTN6AHgAfDh+wBAhf9M/1RDv4QXVaETXz+7pqsivtNwacm6LvZ8ZSUAAD+/hLmvhop7+9zh3VltY8Tq7uxf9MeEdj9A55YBJ/ftL/77S/++0vnfx69fzSt/KYigJ/L8ZEkbCDK1BEF7NKd+eLds5hcbzMbpmVpPNOQlzQhiXkmGcXKakb6f82K2t6L8+HKg7mq8vOGsYoGL/EOfEjPv3QceKS4WD2NosnPJxnbrZ+lLmBpqUtme/C67b6tObgaZD/zPgXKz/+Fz+0/7/kZv77eud//EbvX8j/vsHfjga7W6kS2f4gy/rSt+lgfGO29Ce6r9+QawWJg20nJplRo80DzTfKGXg99OaOAiAsT1c/ayz75nvR18FcIz4Mtr2hf37oOPE7IMAAA",
  "caltech": "data:image/webp;base64,UklGRogCAABXRUJQVlA4IHwCAAAwDwCdASowADAAPmUokUWkIqGaqq6oQAZEtgBWGbj6n96/F3lktaDIbtMnAeJX+DvYA8wH7Kerx/HfUB/zPUA/qv+V6wD0AP2A60T90rDTSAy26oOyyGoGncNGZDCv1TtbI5ltofNIuPrdgK1j4OTfafRkSoIPXVqp1DFjrILGBtAAAP5RvFjyEpnuNPnc0jZYPzGoOyNBkwxHnwqhLsDn5tdtO+nDB2Uf/9SKU6odcZrazeHHHTxt4VAz/9keZ8xDykAybcu4A8G9Ap86FpQbU5dj5wOaiHKVu+ja1YDdxPbdk/borIvz0iBuXagqB0mxefZDuJhhmAx1Vr4OO5J+AwJ4Qo1LcfRyX6jU1Irv3MXRrNOILbnwG5I+zb6ltD5zpmaWPAUpGBBDf0SN4e9kDofne1nXFDKoiuNzo6mELel0ep5KSualHH/kd/c6rbYwvKOh0NHCZ0p/8MnfQ4zVk7XS1eqltbpSG/E9mcJtfk7ZpTaXEj1f6xp+isaNrvLgJHSnZ+Np08RHTy8vLyJalALV+rHL4M3XpXNFrz2AAHRp0lhRHtNONY2RjtEUp3Pl5nVJeqsAUdKvONrybJiWRUe5SxJF+S7GrdIy3LJit5agA76MDnGx2wjzAcDmI127X1cV4uSAdUNileOWGgk8+Va+/2ricPi7d4mD7OkHKVFfdf4WNv6yoctVZLLu0tIVY02wWE+NyD032tfQYMCvWzLmMOFxTPe2zm4jN+eggkIQ039/SLWGYkPdKzpV1acuY3w/Zg7pmI2zVOfyEveZIr0q7MGAyVflVsD0kAq/VacqBmB04AtiSsM1df//uVBVwQ7F1qHXaUAAAAA=",
  "duke": "data:image/webp;base64,UklGRv4BAABXRUJQVlA4IPIBAADQCQCdASowADAAPm0qk0YkIiGhMdM8AIANiWQnAdwAMY/G61aCmeUUQQDbRG6B3AuECYIPISaZAPt/il4od5xSC6BcIH6X4cAu1Xo/eBKQECgAMnd0/AAA/v3ZserF+9VJyYHwCwxhwmloktsuZ/aoPWsfOr5Cs9sYbFUCQUh+0KooGLYBMf/kp/TbN4Qf5PXj+sfoT9Ll4lkH9cC1szsjs5MBJ+JLuTPxrCB/VSw05y7xWlalsCRl4dfpfN+/NWXcCuGxinOraHnC8LNBcmfBDwmlHKKaRKnhgzl7e6xcLzjGGLJBXugLy+JeoROvFBWhl8T8tyTrGNJ4JxOSsE6eWb9gXxzL4Dx9wxVMyEnISchJ7jG1kA72hcZAVKpdgixfoXVNQ/4wvg7vi+1bMsaKkk0/ynGRwQwP0XcSl/+zs9vG57TBWB3Y0s8XzGk7bFhjlRUnUHU5jA6zmnJXVP8c5MbAu9XhoYmMUXbDv2fB4eBtw09GX5bnQojmv6O48Na2+dWXNV4UntPSNjUp3YNM3XTuR7B/45WeXdOn0r1BMdXezLLMK0Z+fUY1DeKaNvkbarOdere94peq4CPtpoXalnlPvWzlOV+FH6x94Xj43HvQk+SEHtnRP1RWCejGvF0CNqwmRTHNJs8cckti/MqtgAA=",
  "brown": "data:image/webp;base64,UklGRswCAABXRUJQVlA4IMACAABwDwCdASowADAAPm0wk0ckIqGhKrVaqIANiWQAz2GBSAPIArh3/AZQB+x01c5R8+V8X8QPpV8jG6EcH/k/+P/Kr+Z6sZx/caHnv6BHo3/le4P/I/6d/t+Bd/UlfdV4jMI+rjXghcoaAw96wEADU0s+Cd+AEOJ+zLiZZ/nh9H4KD96G/QAA/v92O36Tr/0Oo2Z3nzUJAqqv/SBpl/O0G06MB83S98ZDlj/x/U4tBZ7ieBtHKnCSOVaf9XZXwlhx/3EuPcW+P86I/+U/TFv0ad3/iY9oBnIe53diEEaJyDRhmsEQgHtZ0O7u3k/Qf0uJuOPa+3fAc/6oeG5g04X/T/RBETgZLfOh++hfBr9UzyKRTywJdzszrO7SI25S3pW/GFgb//Kn1OcoW6PZ+xpSEEd1jn0S277S3TBpznOvYL+8D+eqCXkR3zVtWG89pvy+sJw/+qd1B//lxyM9vLJ/HTzJ+Zg65GWaX/y4m/K/3H/OJzv+JfzZH2PBdE8D4kTriqpayd6465sVeg2hMFa4B8I0FTWzdBrkIzm1ux3z+iuuj4k8hjGSTrL//ERZLC3hluNnrf4VdIWSH3ZdyIFiTdo/+cPvgSmzuse2TIQXlxe6anI3LZ/8/KSytWGX13ANXptPa2f5EhzyrPmtu9eyHvVYkcxx/P2836pMlMLPM+W3A74enowtveRSFZHRfxrTBzxaPygPpv+66bdVJm9mpGzZT/tHVRD3P9USTO/xo5dlgHGYFl1QqtfzlMjZ/CKgdRFMKAQ+XxDUjv1+xzDgJmqMeeOH1Qvq8Uy6EdhsyegdzlGSeDRHzOwX6p4XVsYPMinAEKDsvfIhNahPJiImJHRrMMiDwVHuGA/FX8ApNf9Sk3yjPPBi/01Z9mKe1Jy6n8MrY8AaLKHNtmVnrB7Nn6eeaqgIy6T2oFxXYPkQLkYAAA==",
  "eth": "data:image/webp;base64,UklGRlQBAABXRUJQVlA4IEgBAADQCACdASowADAAPm0wlUekIqIhJzgKSIANiWkAE8BfAOdv7hHxPyn8kMxVyEbSANNj5qWdJ5T/3pK2rgf7XOgx/XoGxi2qiOCAlO5aIauAAP78qCS+UiJTnxiDMFRyfhD5oaR+we56fXVOar7LwL/4NAkG/GG3/21fmRY9exm6f/1lh/09MP3a/zR+We5faRoVJ/1TzSunDntZ/KD/L7t3SHmZ3q6p/i6VxbvOrWgcU20dbcF6rjtgk8kCX8rgcOpU0BIZkj3p/Qa5uOiiBCp7Wh7s3eXCeXVNrDlotecPil/fG4pWb9uw/t93N1KEPoeU/QoQgbCg/uYOo97WB7SPNKP3Va4v+4eCl7riC/iBuhzIObb0tAYauwa5RJrcVQhFx4tb/J/3f3cePL/sAfGf/S0DD0Rxj77zLUItL3Etq1qGZPrDkgAA",
  "nus": "data:image/webp;base64,UklGRowAAABXRUJQVlA4IIAAAACQBACdASowADAAPm0ulUckIiIhLjQJmIANiWkAAHdpTpDWnxV2hehpJU+iTAAA/vnGIT+FxGYRamZysX8B6SAD/kZT6ycqPrG9y56s2a6l8mzdckU3+lKQrmBl6JfGcm3B5qCkwLg6Tlyv30vefuDHXBXA1oxBID1eJPBsAAAAAA==",
  "ucl": "data:image/webp;base64,UklGRuoBAABXRUJQVlA4IN4BAABwDACdASowADAAPm0oj0WkIqEcaSYAQAbEtgBOnKC/AOPioB1X8VeW54o8DcNFwH6X/jPtm7QHli9ADmXf9v7AN5V9G5kY4w7/QJ/RTj+t9O6vhEgaZXYlQnxIQtFLVx32MkPxDEz6ApQisyAA/uwmWFNYU1hTXCmhtk5xr80Zk4p2/ccesAZLFOYndrWUx7KAvMpkpZkRzZRJKal1BNZPu7cmBg+MfGrea5Mdq3PXecMOt/WTm80G6u3vFeDNXSRWyDbciN2gouM8sRyLQgGBvgfufJlHsB7Ccalq5XJz/TpLw8g3/qG7XzyJ/LjLaJ7Wn4sHuPPytHrB73WHtz+uJgFzcGqXrIIWSFUnwxEEgYofvAyye5QZ+3F15mjFOY3a4a+5i/Pwgh10mvBA6iYuPfp4zTZVQvJFFa6JDxYHjvzXN7YrVG0MrrSvJ2fP7wiP8nzIjP52F4SIFTWSJR5buBpeoCm9H+mO/C0LOjIsOdS7RLdZP5NLGA0Sn38mslI6PysztBT+mT2yv/xqsQUOMo//Pj2/5S+y4JjfRdOsyFCTDM0fOkfTbEz8lt4/gW72L9Z6Jqxpft+N4Xqn/JncNDDqAkcW26+yMlNTGv9MQ5IPnWyramtnilWVAAAA",
  "jhu": "data:image/webp;base64,UklGRnYAAABXRUJQVlA4IGoAAAAwBACdASowADAAPm0wlkekIqIhKrVZWIANiWkAAF3j7AXaiF6LRNndZZAA/vlYV985e/AioxNrZ2wee8k8IZRRhL3V7Y45nCRD6JB2TwUArx+ZpSqF+8K/T0A+2r3fICiE9etvK3yAAAAA",
  "northwestern": "data:image/webp;base64,UklGRtwBAABXRUJQVlA4INABAABQCgCdASowADAAPm00lUikIqIhI4kAgA2JZgEGAV2T2v9LW+2AuzNdAJpJ/Ga5fTEv1V84VIqvvl673XU3LV8zX3YXGh87tv9lEyv2LW1Z3CbN+V6ryvX/bC0AAP765xHif9Db/10RPiXT0l+xbSA87730c3lndHNnh0+VneZ7XKxhF8Dz/+Zo/fJ9hbX1WobQrt3M0H9C9nr+8ee/rvd/6P/E9e7pnWyoG+Q9QxnWfZ9hwKXFjBuXBoNUyK6w0lXNFcbDf0C4T+pUtU79CjBG/5u5vsdOP6LKH98/yl0f1Z+a2LXSXS/zWUqTSc/Gnm/v2Hn8L3CzNIm8PyBRoUtN8OlOSmcMiuLCdbPsYr1IvX34NMIlaUhpJrx7Wl5RYAyO7FtpxmzQ183VTw9b34uH+dYtz8Qm91s6DBizhaW+bJv+pu6vz5f+ZeTFqpAiAzJyqsC2w/+ueSP+rni9n+TCti+n8vA7XCAxssCceGKKqPEbhGUj/vmoH+8aEgl/nTfUWzPkyOQ27+gtj8qA4+RNZaAklIBex/3CoS0+x/jRHyf8oMEyIHig+Go0BkPEaWoNQ/yJiW6ARHyK13m58+qleotZIv53HdbyK7/3Q8AAAA==",
  "columbia": "data:image/webp;base64,UklGRqYAAABXRUJQVlA4IJoAAABQBQCdASowADAAPm0ylUekIqIhI4wAgA2JaQAD5es8Repkoi092nEfI0JGrm1ck4KlewgA/vo6nb1ozDgvyIj024+UjQ2Z/jRkdfk44sgYl4xY5JbSgWrBYJRL8I3vY5EQLqpXsFz084tUkP7yTzt3RHqbwg2163azZySpRNpRj3lcd+hEvXXAOKLT2KRNs9bPvhAG2wAAAAAA",
  "cornell": "data:image/webp;base64,UklGRnIFAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSBwDAAABoHbb2iFJ1v9kVtu2bdu2bdu2bdu2zYy2bdt2lzLPh3jjjcieiYgJkP++K2XVAQu3HNi/ZUH/Kilc/ks38OQ3NL+eGJDWPwXW/sD299X5nEu2+C+WIYGBISr4uyCJQzWfobyzpEPZrKnTZC3bceldEzyp7kTAqFCA78tLRRbNKKVX/gAIGe62FW4hQOjKzGI76xovwLywNgIWATyuLo7WfAIwL0BvOIAnuTic8hjAYK1qIcDeGOJ4rANAcCWNRM+AYzHEjzFPAo8TWM0HniYXv6Z8Dsy2yPkHQquLiGTsP9D+oEomqe2FX9lUK4C1Yp6Ck/fDm2QTsESR6gf8yKyY5si9iIrsv+FbclNvYLUop8L4Bo3173NXJRuBriLiPgrechrFxOYJjco+OOgSSfwJHkbRKGvnlEa0p/AugUgZYJX8C7IBfCVEugJddMr4oRfQQWQGUEHnmscwDI9hGIbHMDzGN52qwGSRlRCaU8dBjfxeWCKyFQLT6lw5fET/m06mYFgnsgUC0+mUFJsn7awVWQ7eXDpl7ZzSKeCDxSJTgUr/RnVggkhHoLvFRKhh5wx3Ilj0BVqLlPDBeovO0M9G1GcYLost4C0sEv8dPIuuyhfC2TB61XxMFnXMl/A6johrP/iqqsJfwtdQK/xpQvJb1AR2ioh0AraopAm8SK0zFra6LXYCbUxJPsOfXKqwu+BiEqveXj5kEHW+QPiQwCTzgR0uhSS/D9ezKcKNh6A6onbvBaaLMtMP8DVWSY4n8L6VWyTTPghsLZYtgK9pVTIFeJtBJRkuAntLDvgEH2qLZZYPwFixjHMPuBhfJbGX+FB6soploqvAzZhWUvovcCKBSqTmdeBljwhimfg08KuI6PYBuJTFQqJ0PjY6sVhnuwrQRbRd0wDetXCp9N2t3wOMF5sB0zHvLWSvyH7ME1x2RAYEAQTvqBtXJ169XSEAf3qKkxUfoHy1Y2iDEnnylGwwbOdrlHfKiLMJ5/w2Kb1erH9OjyeO51n5zULzy5Kc4tc0/Y5/1fli9Ekl/k9RZcDCLQf2b1nQr3Jy+R8EVlA4IDACAABwDACdASowADAAPmkukkWkIqIY7M0AQAaEtjWqo4TgRwaU92PzA5xOMPIE2O/ID5S+gDbAeYD9jf1y95XpAP5x/nOsJ9AD9gPS+/bL4Hf3B/bv4AP5H/ef+yTYAtn4BCZ5PHBuKzpI3sCgdAAA/vLB9Y3L/53JMkCCA2M8FwTHeyrGcK0vc8Ex8taUoKouyKY60v+kkc9+2Se0BuCP4tqsQaKDD3RSil4QdP/pHjvT/5DNwZxF9fMVo8kcijv/uK9f/y4rh6FLQ+MzT8FhIfhH+YeXXnS9leII7foQPRtv2l2U4vAyNGs4dG0MXD51nJui5IjryfPs9xmeNz/RL+Xm+1V9Gt9tkTTm+q/IXiiW/cDlOwybXk+ifhe0d47bkWHfuIXKkLbVRrEln9hjOV1dVnqnFGLgr1G1BW5z9KquAKvrXe3F8s24XUIZj5Wu1jVxfw2Bsd1wpSvaZ1OD68KSuKd1xiX5/+xzNTR/vWKFYYSxigH7/l2a27N+IRH3HnpKolzh7VuhoSaZl233Fj4taqlumZ0k7yFqdQ+Ime6GcFXeGRWIxZX5fx2f/0BbMYKvlnuj1c09+8jmO6Z/bdFWrqCZ1A+k7uCrbGxpvemrHNfeqiPjey913rFNiU+Zxs8u5FZpVYDjDPtS6mX3/L8j+uwkPu/ovT+X/Zn6yXiZPnI5OxY90S1B0ZwWf9WcVIg7yNM5L2TZQs8w/JjN3nagDclZNGqbpuKGvUE19hTgAA==",
  "cornelltech": "data:image/webp;base64,UklGRr4FAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSFwCAAABkLVteyHJE0rKM7O2bdu27d1je89s27Zt27Zto71IpipZFFLftRHBwG0jRYVjvoF9A3KnpOdv2HvV8YfBX5yT0KMTa/o2KqjLSJRYzlSmxcgle28+//IzkXPz59cXt/YtG92qbBYZi1lPWbXP8icBk7vSDDxdPaBmSl1EUoZGo+5/JhbjXmTk6+NJLbJIngtJs3edfyZEuBBp+MLiXnlTeEjJUffgC4sL03pzslk+zd0VR1/95cOcM3pnSk0Nu+zNOfrQZ8Z9kQVOTs6X3Hm1bHWvfOa+GbjbNLdkv2vG7ocJ8w9GTvXNim3/u8mCf1cD0JtlbYy/i0qKsWf/GkSXp6dWEcpU40GIAzH6tH42JJXp95lAgX4bVEnWW678azBt6RBfcPQzCw7s9cRijZcFGYdjeG37fvtNDgjrxMh1tzkoH+899RIW768++QaL0KvIL1hYlJiwYBb/70nBV6IE+hD4C8HHydpb0HHYdx9snB8f0WgpcB61g89TveUqyDqwuUO8XLb/FzAlBgZVVlDmmg/DoHUMKSknXoCtk9hovvgVA/G75bY6jHDmXsdB6jw91z8btveRXE3uAERv6EHrfLKjI6fIN+lEgPn1mRkFU2LkkFZj8h3qsw8+nFFHw8iFWt6mJ98wH35/oW0hzWOQkCJP72VXolQwPGLXVg7Mn9Kz8UtZ28x8GqCMCZwVfD6nfXaRoQg2UjcYvO1N1EMs+m7nsMap4ySxgYuavXKHSetOPv0YsZ8e/fT81Iapnavm0CQkSjm+RMcxB2++N//B+nD7yLgupRMU5EoEVlA4IDwDAACwDwCdASowADAAPm0ulEckIiIhKrVaqIANiWkAE9B/RPA/vQeSfjP0WKnHUL68/1XDLtff47eCMr8Tml3x3egrn8+qvRp9FX2YLRQiijBN6yoPufu0ulWleKJQm9D+4N4ka3flsYCu9L5Iq+m4R00K+Z0KvZpTUq9WCQIAm+AaRRbDpjfbAAD+/syvr+jiXNvtbLXH/Dp9SW3YabyFT7bHCbEQUtl7rMapIYkya2Iedqbp71P/T9Lkutcr6T7Y1CksH8Z9/ZRtNipF4nCCUdkDC4qe1bS0VC5DNdOrlh0DfR2+Z+j3HXu6uMMlioVE58V31w2xgi1djN0r+8tMhrZ5IQ885wexfky97cjlk9mWTBZGOwkR15WbgqrqkPmzZ6rTJa66xIOxsWYnzPuevNykALA47ypduYkySsjJWrxIrfv/hUtIRIhLDWZma9AmESEYTnRFNVAeSmtLxL6pSjdnI1Bh74MKFLOgTWwskSvyTYmZa9QZTmzYhLbqVRg2jzoyq/gl2Gc6OoLUbdGxBs66HN6dCRUoobSpQeWNu7l5MEN+LbguDOr7cpzMI36madTQT4cUPV7+HBFMollh2d+ijdoGCD2jkOd0fZivHIVU8iuXYVNEK+fpsZ/pT45JL50Ni/I/rOsWORs07ErDLtKkd0UMJmMlfpBKVJyNhXqx0SFSGczSa/5QBwOp6qlgVe7Jpj+5KkyGrotQAW47b5LBhvTbdzvyPUr2e3uq3KEh1tNxCUDF0t5+hIYTKnukIT4L1o/fJP0oQFC+4tmX/AqquLNl6n5T0BNlnfUJFDcAuf+2gYXTVuMYwz3PLjoRKfS5cb0y7B3lcTSImuw1941FTRzDRLYjhb0FYI8cayeqJArsnEwhTem6LCPeuxN7cZMz7+1+p4sQC29snPyJy4JngUr/08ifPy85qFrNVBtNM1rh72kYsaKuTmXVuKAKf+g8O4cO0OXbD2QbD3lGcVbRkfv6dhHEEmkflZgM+taFBemcc/ji69xpZ4pyAkltMMBELk0DAdLLLzwMzTmCK/2ZimduUT4aGN7qThXseFmn0wE2KjhG4Xo+r0xhFAWn9MzXb8n+QEkKOTAAAAA=",
  "upenn": "data:image/webp;base64,UklGRrAEAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSCcBAAABkFvbtqot5xt/5ErmHfzxR/jH0IIW4Jm7u1PGX8GfYaGW4E4BZy3kfffeD4coIibAXyDfdYff8X8HfHf+Fflkfk/pp2Xh+wGXt39v2/v4PUl//oX5/aTP52NJmkATXIrYLCg1ADUouClixTMTrASFCiF9tiIiTgpWgipZIXgyImLVK2sTO8kKfbXym9hTkxYmFXuic/ROEWlxUnRntCsWPhSQVkLBh4UYvIkBYDUMYFOUHukCG5Jdh6O4d/WbxKbwzZVeWYxcVdLGoFdGorZ3RKEN6OFoue2TZIvET1uj7fpHCjWgD/vRev52CpSQmLfmY4gbHytJF4k+2hDDnd73SkmARF/unY6hrzv/WgX19bm18V2u2fdU9eneNfHdji0+uL84Fm0BAFZQOCBiAwAAEBQAnQEqMAAwAD5tMpRHpCKiISq1WACADYlsALcBQVUeFv1zi3o7euKmfaA2zXmA/U/1mfPJ9QD9Vetr9ADy3/2Z+FTyM80r6WfQZ+ND7/7x/IP2c0wD+K/3HeCOM/zjQjOPmMJZrPlr/te4B+pP+968XkgKJWNZTZgSm9qiWNDRWdF6gRdny9YTlR3Ov4s0v0XVi847Yg3Tw5aW39q9zjHQ4ktiuKOuAAD++pbvODTx6h5O8dLxMO//Elvcrp7J+SuIaL4V8bg9xf9LB9ygQF9R/2vfPgucRcw/b/QYf/fximMC8e281zxPeEv0sfpHGMMI5x8faepdd200v0jgTyDx0LkIjhBsomaAfIucBH/H4chm4l6iMLcbkkiD5nPL19wqjsaGfEev78tCoRhils18v2JAaxcKlNolZzLNfweVflST8wuE/Sm/1qt+Ck3C/wsGMph2G4P4uX6cma/ekm+8F+V0fDXR6sBlWtWkjvP/YP7wKT/v7irGpLvUS+52pm3wZoUbbu+Djk88tF3MYI/bQX+TOny6kBbcBmhPBUxsGk81f3EsPX2em/5UsQtkWPHbGiVWofSmqhrdzLcsnsk6b5kc/yCDEcFp9QNFo1KfarPaeQHZ+GqwHSqijlxS5q6rnIU4utLr8CALl8giIYuNlzL8FVqquuj+zuWeVKTacaGGbqweiiiaJ8h5x29eCAxj2GgbZ081bgQSWgEOpZCxXMJiRl9BL911Rjvmv5YauGyAmpq6a/6CtxZqGFZ6kbr6xnzYT2Pi+rsgl71H64TMEn/rOaKuT/7SONW6ShMxKE61XBvP8sreEvfejmJFt9xMmbmu/tMTo6kSTxXZjeuSmg8SOHkCjTapJfSbTcNGkaH/jqIHCaMbykPKNZfb3SvuSuf1NH9N/NUfykF21DPUZZtF/tnyalyzaYaCTj+cV1TekTv/Y6XkmL1ZKPdobapJ+SFQVzWnT1cf75IaAvRpFF6n2PgUfOGFp+eURPnZDUa40LXIyTL1zkgziNLT4j/9uhoEGMJJytpL5yRRMG/s4eMTeSrcby/s/qtXtN1sQNxhVjrhb8w5zXk57iIMq4A1WAQ3BhRRCu7BNf2pqrJM1POqHd2n/kq9K+Uswl2j55Ge3x5SPSEJQOYNE9LQAAA=",
  "chicago": "data:image/webp;base64,UklGRloFAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSAIBAAABkELbtrFt57NtNtu281e/qoZkG822bSvZtm3b/O+9z5P/EBETAADAKKvn6OwRmpBf29k3Pre2sXfwe39jbX6iv7uhODXa28XJSkuWCf4p2HF2+/z2SeXH6+PVSa/Yv0TnPmm5JkW31f+I8A7RY1LwXyx19Ghl+xfE0yMJEJ3faeGKonZEh3NdFM4OOvTxoYAXHYIAWX6TukNNNIZ46rKZ0UBpjaoDfcD1fKXmI4wBi7eCmi5RwJcbpmJRB0jqzZLbsgOy+mOkluyBtELdK4n3Hm0gL+C7j3cSKQZUMuoWXKJdlZkwAcVspmnrr3+9rKaZswMNmRU92y8+P48a3OWYgCBWUDggMgQAABAVAJ0BKjAAMAA+bS6TRqQiIaEqqViADYlsALRikv4V4Ndt6Ag0QHm87jd7AH7AewB0lP7a12PwZ8J/lv2A9M5oD/P8K+wB+TPBtcg/p/+W78LUC7q8sB4A1AD80f7r0tfofza/SfsE/zL+2f7/sEftv7Nn7GLB3bgQgHPIpa5HKHChBEVzFEff7hW8m9NXrwie2cpL7s2UYvXaLz8s2+cYUalEhQE58qvQ7xITUpPgAAD+/oef5QSqDT6/BfPpLsVhhWx9ShoC9CQuYVqSIPYehnQ8n20EB6HN/k8adf/1COL7QbI4jGk9/x6nKj5dLaS1Nvg7Qr4XIKLjEdV+9PY9I05R+XbbNtp//nMf9izoV+mBsg5TrI93f7FnQr+icQ/uvcplsyEJ9VQJ4HvKW9jNRA8mRsZxZIGbDDRcOHOaBVGVPLJ+QJHGVzlBWiNsRSmFw7/S9f9MGtlEgfcsaszWSjbIiad82rr5PRG55HDzG1ZUTs02yEbknoq/4+dZc2fpuXo/CRhz6lsHTlFAZJ6yaOIan2bUu8pfoqKLyOZ/rJQD4IS91MO1e//fXjh1mwiD1CYJZSFSchlFT5IQXmnhOQO6r+UyLGwG/kaYz4g51++xwAWMRmROVZftngVQykfHhgBC/Xqn/7Vzt8CWh+jWEFB8f/audsBYOli9SqTkYu5Du764nu564fy3IcJ59GM1zzjs/vfNwopWT1US+f0TOdO8RQzcys9wBiKpBIAd+TZnNpjnIyR30Ey330QpYD+Qf51H2/lSUFUeg+Zyb/+f+YC3tKNVD7Ge6fFf9nHQzD05Z+rtjV9/VrDz8cqOAB/cnQVduh6xR1CvoJkhehQVoCWrodeT6fagTswuG4S0MOHGixFnhP86uUCZ2ChU9rLbgAzBxQIkEhqBmZhJRbnlIbykJj1TL8oqFBz6cftXjjr0Ye31YZfCMt/AGDeyaaSBlnSO/vAwgp1D6PvvJMVFrdmWDwaLFbQEqoOwp4UgCwABYv0KK1jzmulSNUnIs5qGZa9Sk/4TG2WRrZSX2hQETOeQWj2ULHfQgtz3V1g7EMvqTLOdgIQIcpvT6OTv7W9A8Wm9p0pbgW9UAbx3X8TxWobqv8//af/P/Ba/zbhGmrVZKIW07xtv+4AF1W8eT8ktlNMxJy+s49psqyDR2E8JoOmfFURS+KHc8ODsXhzMNK3l9iBtlxMpQRYJBvQ+9Xgt+RsPH0vPcR3Ndekz/F2YmcrbZlw28pWpcNhfW0Q1IlSI7eZVmbr3mJhsxlc0WuxTLppqwcvBSgTKU0eLYODYPeQSJInspqdkrjD4oCal/nKlvto/oAYpXzpLmVD/FUMIxp2gTANT5SSx9KJXgdCYqbBw/f65lMZxHkgq1uTDX1mCbYOz5NQxXGbzr6UL/H/SWmtzJYetvd3PduWF+2gAAA==",
  "berkeley": "data:image/webp;base64,UklGRuwCAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSDcAAAABYNtIkqKN8FifMPN/IgwW+u2/FBETINFwfdir96I/uCtp8UYbT9r6P7XRxoIWK5qR0F+cq7MCAFZQOCCOAgAAMA8AnQEqMAAwAD5hJI5FpCIhGq6uqEAGBLYAQIGub2v8SeVR0g797xLX39s/KP+k/Sr0AbYDzAfrn+x3YA9AD9kusn/YD2AOlA/br0l2iCtBIr/Qt0QWhQdCgTDfc0jgDCwJkPb79By9TCcGVxPn7TzHEeL2LGRUi6FnMizS2SHPgAD+/ra0f4pXj7Y/mtu3DcglbP8jB8efuvWr/PpP48VkOjK///VgS5/Hb6qfTjcK5WB//y23n83cQi///FWv/q117ZXX/+kYfAJXMF5ouLLW9EiXFhkrm/EQ9mKTlZjH+vBWuMm78z1VmNX7PjDpNNt4Nkj62X7M+Ap37vBY00W1ss1G0z3TI5Ye24FFG3ZHe93QAxWUy91NVP9+/XFQ5p6v8LMpdbckv2ExtvAz+ucd2+zdCZASrApzZfu7pt3sQxqnxnWYYKQaqkrTjNlJ/VrHRHzCgf5fep6NOxADsGz1629uZV4Kf/4LHt4Vz/u/sb8vMMwiHzmZ1qHeIH/A4X3O9sMD4esGLpZkELEYKnoBZC3/FKlIU4l81j4piST0sHmkMRVJN2rHciwA+Lt+NgV968Wsp4iNITbiQqHgl54wCnFbvRinadbLXqAnasD6TrXmRL+SvnnhwzaICJF2Hhbp865PgkVhUUfZ//3bVm+IM2/sJ4fvpyeDCYwSSVqs/+RX2Xj6+UHKY+ILSFz3QYe/XjQuWgtXU2elRAx10bi5y/JIX8BujbC/Me1pv5saBdC8MAZ2kDxO5C0eoeNHvfLypc+VEGi4+GPb/P8xSgsqU05C+GLomwNL3HBgtw7iU20LWrbS1h/A9djYYp8aExVxnzE3gUp+PHxaTuYpZKug5t+U/imBHpM8gAAA",
  "ntu": "data:image/webp;base64,UklGRqABAABXRUJQVlA4IJQBAADwBwCdASowADAAPm0yk0YkIyGhKrqsAIANiWMAyhUACqjQKhmHkTh9rL2eebzUNxa4e8B9USdaWZPAysawT2zvqEgR89+lt6IA/v1RITdVuL/o9ocxzV/5FL5hh0yEcY/N2P3//BBfxBfxB9t/6emuIUejrCG9EweT7+f8vGvZqm9PhdixFY+hxLq7bX9GL7QDE7FlEeL9rwD/wnPIL3A/6d/hacRV5QB0Hn4mJ/IfjxbgSwu1Fi3+Z/JuiQLCNFot++GqXrEXZmnpyCYdjdl3GD70nSTADct0UcW7TuMT+H4lUKpnK2iZO5q6+M2u43sApxKjZTufz5TtBtP4KkT/8DbxsRx72vUCwbl+C+rhsLEXnBnbI5Kev1411qxrDkjXVdmBV+3wOPbY7DcKwJVH9tYYldch1/lbcD95jaT6U1rO4HWkF35i0yKXkmebPi+oDuD2D9j9Sw2SsTYAcvxS8c1uD/1buczVTv/dFLlMf+PKa25WVIGAW9HTBiSfc/czFe//duLuY5SzLxATOeTKZAAAAA==",
  "epfl": "data:image/webp;base64,UklGRhICAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSAYBAAABgCPbtmlrf4a2M9s/sm3b/z91wdFPbdu2bTSBzbi1gntevZO/JCImgIxlfaQSiUQijaekjvb2tkInojypROzgLS3g0gDmJC1D/B1Pl2BG5eGOSw0+amtr62JoBuM1rRu4NTlAT21tba1tPs64NGCPmDOoJvIRfi3OkUviIk7BSqVKrVa50gx2Vd2vOKAapUqlVrdwI0oDgCiagfgxgIg2AHxRIaek/f6szMxMK5pBT2pKuCWRbl+RlZkVR0Wc6rFDzBl0EPMcJSQuwjGXGnwPDAwMVtIsZKwjlOv5HxgYGKw3pFqAeIimBSnrUE+hAPGcIXbhTE/yjnBk+cTYMWzCmd6GGBEDVlA4IOYAAADQBwCdASowADAAPm0wkkWkIyGVXVaoQAbEsQBom+t9mpm/l6+6fZX7gNor5h31zMgA/Wb0bv12+DjyXgjCVDlO50Wfcp9GwAD+/TZpt/0k6U8DJkfCaXhp1rBooehd0meyp/4+pKD4f+Z1mLIf7Mr7D06/D1g6U+H/I4foHX8ZHqnp1wS0DpzlvM6qQJtFjAd/WzPWA6dEF4IX62Z6wHTodFMfzRqpL7DoxSMuf91TjvaDfAXes4+x/4RBJ86vH/3etVsWmw39s7hbv4pHtcVeYbOQ45gP6XCeNVGp/8BCtWFg7WIAAA==",
  "toronto": "data:image/webp;base64,UklGRmoDAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSKcAAAABgGNb2/HqjTWIdO7MzhpA5pN0fx/bGQlvaduuf8R66ltExATQstSSHnxy0z3y3weMW0brtcyjMN278JrRrfFNpqBHkRW+8ynsY4yItOMp8ImZxMwUuqKw3GN9BlIC1rQ4mIJffKKxHNo/uBzcNxo3Qbtl0BruF6zfhDSD1VOT/hDpxkZE0UeczyQtx05RbpPiFWSqfCH89a20XukvXrL74e6acQ0tAwBWUDggnAIAAHANAJ0BKjAAMAA+bTKUR6QioiEjjACADYllAMtbwksVv+xenw+fkYZwYKqFol/iq+ANFr/vfSU/2fJl88+wP/Jf6X/1Owh6KC9KsRvn2127LbXqESOggkgyRY9aRJJDWdheAYZ8wNMN/eioU5DYRd2wIutQAP7/diQKnGpuVkUY/wt/YLizYad8WY2OMjW1QIG5oWo4zG9+/gUmARH4gvhFqNlRUUko7WLH1FvGW7NNyGNH5VyDIIA5brVluoub/35crD12oE5UI2m3dB/swf/N7VkLgYPP0nZ8cUP2AgkcTTqQyHHGlRzv1TU2Of4CTv62Z2pDGXXKJeptSCuOkukWV+0HfOhC/rhzhey3ysH3+61rlnQ1LyDppdJ/IorpLBKsQxv34XtyHgo7DXz7WHE377C5+/MfMKYb0MKpvVqlKIrxX0gkkfXtWCzTTP0JvTRqt7tgZ20n3wqfsKBbyIqqYqe/foGd+dctu5w5OOH7X4tkUtlSnHbHP8bzfPw2bgMhm7WTkfHJQyeKfspKOmYDi9JmRJEH6ShkAaO4YEOoHaygpY+72bYJOn3dj1vswHijHp2o7vQoyK7A59saQw0dSRrv6nOVDfq7V37am5jAoW+HnhJW9H25vTwe3eCnlt3Mk7pF/ex99D7id5HVPNoMNQhnBqrkTeMXNXe3f+KhxXIA2o1qaEVsPk+vfGh5Wp3C3PDNzI0dDR96jiQRiJzidWuupKGAz9ecfwJ42HG4bMFnVbttYSMf/Nv6oW77aSIFUU7R6Pnze6Pb5gI87xCv92WQBgWo3921ZFuJzPIPTzz8OVQumo2sfwf6MkWPNBP0LzMcPGmBiw4UNBOWoyj/W7M70bQe7IZD8nAYq3b97RC460nIrkUEOAAA",
  "ucla": "data:image/webp;base64,UklGRvwBAABXRUJQVlA4IPABAAAwCQCdASowADAAPm0skkYkIqGhKrqtUIANiWYAg7RKvwHCD5AbZa7gN5eltOyBfmb1jywPDFyWqt+QsgGHCRIdo2+CNqLb/fTBp41nL2T1USfQAP7z32f/+Wf6Tb5KnP/41q6H3EyoOw9Zn2/JgZS/0RsGOi31lgj+9Hc9936g+Nj5mSHz1SEY+cBXXaQfXNCyhX/LYpIydXiw4GBpz3iICa/NGZ9O6dstAheAJ26xuioTlB2A1UuRsIEgn6Oma98vW8QbMpXg3HIYd1msa8R/4n2Z2/iZP2gg7oxfYqnOH+ikb3ayqhaDop6EEblY/qzun/9p8+OMif48MaU+Aa2GvyghX1cE5O54tKdBeRav5Kud9Lgt5o7b/0V9pRrvL40P5P6VA2OMCnvs47IJ+fb/3Cl0XBNBb6DVbP+rT7y/S0k/rwTq+Fns5E9gDXAi91oWj66bno9qoKOnkhSlcxet/LkJZ1qMlj09kKyCN9WnnrCsMGUuRHbjh2d81c8/86OmLUcRW7vU5pvp7kvZwz1AP4HjO1x/+IODXRNv99eaLR3DXik+0mFy6j4dmcYoDgIg/zrVFLSCUf5Pf4f2PAQJJ5/n6Kmhzr/RgBd5alm+nBEZ2ALTz/9smgbj8803vccvplgWXRJ1LQNkf/NjZAAA",
  "rice": "data:image/webp;base64,UklGRoYDAABXRUJQVlA4IHoDAABQFACdASowADAAPmUmkEWkIiGarAaoQAZEtABfAeiFZ6Iehjbgc+7pgG8f1xfVce7fkBk6PvXgZ9aVkZ7jPYPvpe6A/nfqR/mv+Z/LfmBpj39b/5f9k9UP/S8kH5F/S/99/avgE/kf9P/033GfNV6wP2Z9jb9hz0ATiv/DHA9zdz5EFFNgd5/N+TE2Rj+/lezArHP+3rf43D14aMps0pZ8/KGe9+rNInwr4gAA/v3ay4YM/3C0HGBH8syYFz+w4nhY91GkGv83/A/Y5Y6egrwHQef//iOypCqTggTpWIqXb//L7UfvitAaf3SL9jo9OtuTN/zFHklS3AElNtX//ln/be6yT5fstBAxL9DfgUNy+3I4qe+QoWQXTrg1MWWqcpBK//Hv3PCqWlfZGeq5EfiOdV25Yfe3zCrqKWf8pJ40vXRXHomKei2vF6SIulD4fqy7qojU0fP30nO73fgNCMj4/BcsD7/nuNippnKJ+ncwjUrwzhsqQcSaR5zE2r/wlz6Pzml8Mbz+OEB1xIzJ4Lzy8hpP33fejeVl3tDl6/UA1SvxgoG1ekHUxO3qbOz3rCCRt01GJfw6wfQV151fuzF961EBWNbyQ8L49sL+JBcqJaEpbrov/25d9q8bCf7OhdvdTXX0Awz3cK4qcobj5x9Ns8hlb6RpJwJB/xIzWHd2tIGV78ulsgk09hZvHlV1OZaJ4vD27Stb+A5ravaHHp/TQuVYvWvjur37bYyt1PL+M+iHh2/EjMOkXsSC8gkSkQbSxDZCP/sfDKRqEdrqFkA0KwlLeANGAPZzRVYN/xRavjzw2COvZ9XRd3dg9kzINoReogZemSZDttGnw5wzrca8374MmkS08HMsx6mBb2ZmbqJ2mUKb8Abp0dsuFO3yPz/oN+qc/kfTbx81Cp6ByqjOyiBNPh0OpuDOPjQk6EPEqoWZFlkYhmw4UQO04rXQJT0nb1yn5ud6rvAZXQzjJLVaUhhtWQScT6J/Xa6ns8B8qrz/6OJb26axRi2QpxKov0xZgFDphX7O/7uedvIfsrRUicfNg4UpgBbAFW0wmTWN2JhPjYDWIK+Q80XQ7yVnAIzz1FQOFNjIN1Ukvi2AyjVY4UDJv2T0pXDM6OQ5iAiFQ0Ux30jAxWJZvzMwbxsLKkQ470jul9ZqJ8GhK1DDV4vCc3WFUUIhMAAAAA==",
  "dartmouth": "data:image/webp;base64,UklGRkIGAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSNgEAAANoKxt29o2+n6xZDux7DAzl5mZmZl5PdecwayYZ5bMDGVmbt0wOZw4ZAiZf0mLWL98CBExAW8dmKVCHLWI3+tqqatu8ihg9CGuStHigGjBJKdlprCDDa2jKtlLR+oqcxyApnkxQU5PT0n017zoVUgUZ9O0vDioflpEACAl5ZTlUtX3BzU9gHop35AKgbvWOSxCAABCzowyfPt1mMAXtrMGtF5nwbDA98yQJwEwhQvya26O6oXCkgFN7bnMbxy/altvo2IAmOfOdV3y6ChRliYbermk6EcukLLjdvsCcyygKpeNXvTF0lREkbn/pd/Lu2ladeWd7A2SDkDJ8uGrwRhGcUhmL/dtL9MePEhZ7g2KlA6ULWp5pMbD/W/hx+avbtsD7vlHXn4CWyQ9NLP8UUc8wg+fV7y9oeaOsDnph89Glk+j9IBfyN8JG1IitsLX17pmHwRu8IdOsbRgNMRTOpAxzdlqyHcp8d3Vtb9fGrGPO1Jn7kq7/KVlHa9HTbE8xUbCDx7Zdp+Y23uxg566Xrr59UVm1TRaD9LyncNGTHzry6borCOzHeaia7+0WCAlLwKETInSTBbxyAfkBoejtjfTPn7TbzbnTy9sGlDslA5kJLaSjf7as+fCAtlX86iRieAZC8ql/puf3J+9idez2j1kqPVlN86YvXJ5qetfy3a++s7tGreUNCcN9EU7IhOThnoHOl0+Kn92str8ykWLAFSGFRMgm5lI4TdkDA8Pu/p6uhAdeGWS5Mz05CS5OarSOmC2kOAm19JdpVZBDXj76tvY8tKMRFELeKtvNJbmUDq8QKI+v+iVk9NyC4oLc/1PhEW43ens6Br0jOfuKkQ6FENCSZ3uAd/Y2ERQYYu5wH9dKiuaOQogNUsDfY2EzsN9SMEYR0IBFuFBkASWYRlgsv2gr2ASVDZLUViaZhlGq3/Erc5WMcYKxhyOEISDJBFmU6USCgUDgYB/cIhOT5JMkiTyIu4dZRkd/wSB1nNthI+GoxhrKmOjgn+1aoiiWY5jQrnrrLE0n58Aac8baJZGMBmB5h2LhMOhYDgcZGaXQ+yQTyGArKLXbgBOEi1JclcLM012eyaCgYiqZZdjnTEPSyIso5ymtCSbVVAGH9Qx8+bIKODzDg8qpW7QHRoF4oLdmXjC1VrrqO7JoSK3B4qnz6gsTJGobk1H64ySRSjVWdfhUSwcTYPWXtPtDvIpxVU5mKZjjbaJZGMXX0oCDcAVFPZ10OWmljb3gKtnAK1cwcXq6Adyubi1E8CWPzXHfaWDnrqKba/p8UVxRbIKMYNvRAPc8opXA4Xl1qYf/kuD6NPowd0Z/fWusqIoxG5xIgNgWjuP8t799n8fA6C232nP23N4dkIgArF9T2QwbJoq/PBTCMBCBSjzuPNpfdaZTaCLn/ZDHBFjTaFGE8pqnMz0jDo1ITiEdbSa10w8QFy4xDaGu/9xU3nbrbzJr4Bu830zxEaURoJoc0GZ2uQCDZfOV4Gw6Y4NdGk2SjKZhhCAGmFZ0MdvHsigL/CGYJIWYgh8TxwmIJR5MKyFKVBDDBcr2PxkkAHSykAcgjSoYSRMGm93OK1ASheV+Y0pQQ4gyLDa2FB7ax+PgHj2DDdoRpA6IQCMdY73Dg4HzQgMLmZARcbCHMD4a6cXITAOVlA4IEQBAACwBgCdASowADAAPm0wkEWkIyGXHf2YQAbEsQBgEvWvhreNUaCEg1bmgB0uRpZSBA1QiQ/Vluhizqq5CauGQAD+8P8sb3paW4itqpZDZlQf8MVNPPB/9aH4pUwXu6uWDvjYq7iyctdBuujAnBJ0RHRiQwoVaDrkQT/NijiOe4+IcDDRkhEYPApgGfqNoocAbbr47k0rwatBWCOxPMtqyfXZwLpLrcKPudGa0iyK4N/NyW8sz7qa8v/1kM9LOn9IWMVoyaH/FWK3vN4UYnQBSC7tNsHfWk2gzm7Vx/L8AxPK1kBhHMptVCypN3fx/z/8erqkNoDaM/xq6y0977XLTStPgmrqurKJ8rabLqDaM7ecMa+3BUZ45qI2SjdalUwXLPDyjWHBI/8IahhgvodM7g2ETPSp3dx9iCg49N799QaurjJAAAA=",
  "michigan": "data:image/webp;base64,UklGRo4CAABXRUJQVlA4IIICAABQDwCdASowADAAPm00lUgkIqIhI4sAgA2JbAC7MyXwN5nxfXGhm10O/d/tg91f8z5yDcAfrV+3fvFdIB+uf//7F30APLB/Zn4T/2A9G5yvNeXvA8AKpLTSAVOS2xWhc76M3rl5zfXg3/LBHmv71qWtZ3ib7Aosj53OPwSsHy+pwJUyAAD+/raZfy6tPLweIFbkeAAxoKOKC/8UJ59ue1RZ2Rb0msdvlTF/+u/TVhU7VfM3ODS5diRVTgmqAHKzKSm21QezryCaAbAhr3mEabGnnteZKg9//6jk75i9lXyA//6AE757dlR72PUjMwRkuQ7VPt3HXvfvYQi3+tEB+ntKASAVYhvXbl973cu/XDxCmt/bNaaIaqV9mX+7PJErGgi9pvkWtz0pDLjFn6pVyZQq2Xu0k1tVqsFYIrShS/GlnqHIDLJWL78qFlqD5akklkfrxK9gx8ZCdG5upMCdOhP0xEVjfZnrQ4YwvOkwnT//j1sx+fl+pUQtAQJiYSX/GJfBO30TotQmd0bKHGrXYXgqjkQQvN3Iixxg38pmmRsprxzbfzpETD7dP53/Q+JxtQjgHDvtl+vuCv6PjgFXy4vosNEm4FyMN40n3XFWBT/Z1lbO3A/Gz2wrkSPZNI4MkEwYdJWf/79zqhms1XQzuhlxmSQZkB/GmXIu+A61Q6HAPwJdgdoDZW3dkNVJ40wDW5cLFnJi48ob7MfGL5VFm9YudHZ4X6SbvaCmgC2vd+ki0TZkLlCgiMtY0mC8fgLCBWVvR+IYu/FlT+AEngyObYxhcVjffoNO8iUrx/DCfXiQDhk7dCSjaaBjvAKnbC4al2y77+OQRw9JJ0C03JOCnF0AAAA=",
  "cmu": "data:image/webp;base64,UklGRqgCAABXRUJQVlA4IJwCAACQDQCdASowADAAPmkmj0WkIiEcak4AQAaEtgBOmcmfp9R+QDpd8gNsBuIN5k9ADyw/ZH/bv0oM0A64K6vaAaEN+M3MDQsfTTzbfNH/V4QHoAHc/xPP8MjmNZpO50r7aFEe7gy/Garvh4UcUEd3tdwsw542ZAAA/uzz4yrvdEbreajgic2SZVL2p6+7sVT7gVpbT5Zis0n9+2/ye/+vobWmKQyAD/+7J8H2ILgQ119HP0qyzDFrZsP4zC8ryql+jcAwiolM7hCONmY/rWPrZYKaoxjTogOeXIf/UtyU/zSWcKNmmWRykRzeDI8PY/vMYGTSfff04d7UECqaERdFGs8mKXpq3+VJSV4cYq2r5fS5IKN3fvaC3j3zg+VgNvtylem7z9WCD+IT28U2+jH8gTy+0TDu7Lq2p2BBApu0678m2/U+HLwVwt63Lxzo73OYCk1XxXHkWHf+ZiJSfVtQWtz5f8f87ztXscA7CKpWbYbNROWuKT8X9/IL3z6u7q90KCOfVZhCK8K1tJLG9yQeDnmNU1mM1sT0YBtOvRZEnz03nWYgTq+ZUCOfZ2vKR7//J+GNrJ2NmL6rzV3avP8j1k3I01KWFhqdEQshLcLatLuKKc3RisorMTYFdYDNYiumZgXwkw2YoRF/12Xsq9uEvTBLfQDis/Yzih0Yh9KTs8wWuRQ3g76GLeLvRswnYecJ957XYZzidg5vx1+KbLwMf00l4XNMt1kndG1DGE2CX9Y8jEiq56hPQMkj22Vl6SUKPCTcbfMGlkK7mgcFu8i3oRO+YuUIDS4P2EHLhdDzj/Voh03ek/cJvXN7GFYw0tBfzs/euvRYcu1XGG2L7cX+f3JYxanGPtUn8A2dQkC+n/O1Oqqr2fNlKuAUOAAAAA==",
  "ucsd": "data:image/webp;base64,UklGRkAEAABXRUJQVlA4IDQEAADwEwCdASowADAAPmEokEWkIqGarAaoQAYEtgBOmUI9W928wSi/077wbQlAHmB69ex30AeIn/j+qT5gP2q6gHoAfyv+69Yb6BnlafuL8Fn7M/uN7Od3l0gMfzfTlMME9I7Mn8ZX0f7Bf6z+gB6/P2l9lxzuAMixqoywOEB/8yW/Tm2eGwIjZCROO69IEFpXhH8wU7obE5rG+blyh4teV/i4Bcbm61RjnAAA/v8qdxQy/K9veb0507D8xvsiVRIBmqWC5KOlVCBjqskf+FcoaYP5cdAz66kp+iv/fsyLid26mF8OvMFZZ12dUfe+LPSXZ/X/+RX+mkIQ6B+2b9UgnbodUn3l93/8uNn4XW2QSeVOPHsyX4j7IgHx80BlX+Ylf7DH+5KJ138e/+q+8Df6TQ3ZqUpf8oNnz/0Kg/jW5r4WIoV+MAkcphueCgy4loxX1ETsxfgXzvQVRyoPQ41tk+O020PPov3umvlHyif8VKdi9X5Yxd1U/mCiUZ5n+4BJClpWyKRV3/qvZUh6a8O3DAHyhfjl1b8LyPNbXIU97Tl3fDrDxOVfh7+CbN5x7/KHc4Wdiu35jQ0HzjQfq2kkvB0VMCl1I4aNYOjRuMdUanRabNvyEP2v/Y+/v/lIU6EbulSjhgN+yfELhyd5AcT2b4q84apsnuRoRw55OHD/msTdfzN/aunoqk6JdEnfDey4bzjBz+3V8AGZ8kbOo2g82KGYu9zrj8eyXy7lWgrt1UZcBE9CTtOiXbPaGCTCoEAOQks/cIL1cqhxj7Tq8yYpyrXydal1OknNIw2RNuYWHQZnXkKa5QpbyJ/jJUPxXkhX5wfxE5X2/Z3e//+f1fk+7RipjcXiXfkZk8u9nEUAaNgP6UFF+9lZBHFYF4C57qFgavLUOV7cO3wX0/H/nRWcl4VhxHY0YVCshchD0yZL+a6jARH4EOKgXRxLZ9/ApK7nNmzinq/UXsYq87ad1jCR1RmFP7rX8dvk5lHh/sQnwkltZGJN8yM2oE/r9JcWcT+hBznzlL8TZzwrw9Ueti/P3QMSeWgmHRsmk6b7KyP6ww/dAWRiYMYbrGrk8Ne0f5uWsKjqByG+a2FpgfuI1FRM2Oh4JdqZ4RUTz8WGuFUzi0jj3kq+R1pzraeA4/wgGfJ4pgB3t6bhKMvxQOBRN+PEMtTExs0gYupjH9y8Q5gZkk7e6JYorr77s0Zz81j0uXJbjEdQJx2hMvSW2F9C4+siVybYqa64IjbMjfbH5BsWD//yohboJ/jY6oC7hSGPWH5WNq0vH2Rnf7vmJpPRotfFIZfHfiObntliLmVSRpTNmAgjT4agialIRd49Dis/FJB4dyFiKteqX3ApTIwKsdAb8LcBMp03gZbLKLaAuu+shMTzJmGXkT4bSrM9yK+cQA6WuPm+duk2+AMUzNHdQkcs/JhshAAAAA==",
  "usc": "data:image/webp;base64,UklGRoICAABXRUJQVlA4IHYCAABQDACdASowADAAPm0ukUakIqGhKrqtUIANiWwAuzOq/K+k/ibzv2vvgNtnuK/9VvmfoAdKJkfoa92BKwxn/jizS0JyU8CqYkZGqBxgEYl6nuppoBuu/KYc9zVbeUyTPgGpPuGq0QL5Lc8t4AD+9th5DRqtI/tPE0hu04SpKGKlqOcwxFO7cBv/+krdE16Jr/0TX/84koQnRXbJgzFQBth5LxeixayfmplYflM1lk90GPkpnuiiybWsX+7+2U/YERl3La3zjfodeJFbaWs7HyWi/ZhRH8a7Z/TNUd/JhgnOWLGgQuTMFZ6FiVRDO7qZpcwvUEP6EFUZDT4blUQNQn5NFzzeokzBJY+s8R92f/LcklK84DfRC/ND0qgk0uR6ef0HP4/5RyZtmUaAU4JrEuH8kQUt56gVG5t5dPwV8spvh0lT9gBx432QsLdmpPeTvOUjzzU43yVJbpaOcScDjc+sbfoIqZrKOY9xImQcb+60h4pY5BgLuvJshK09kFBG+/Tj0sLr9yEImX2/+6MiXCk0VLnyDwY9owZkLANEsJGF9VAjvf/TzmELi8e76/8Oo5mB6fjQ2BxassXURSwEx8ecBN5cBssNV313eK/BorAPggR0ZTT3IKrUTGx1Xk959MpkZ4wV5b9vXUrRPK3FZZ72CbCkeOnB9K/WLM7dAMaZLUwh2u4gFitbbKuFS0w9p/BrzeFbq7W4v+ODSKAvAv4/5bOAMG72e7AgPAKsbW8+SinYVkee9HZTp5p7XKj252X/+IX3T76WbUBO2yLupSzxu93Xw4b16hkUw+CA8NJY/w2VC3dzqfpJjGaiFGzRd0ngi7gAAAA=",
  "utexas": "data:image/webp;base64,UklGRvQCAABXRUJQVlA4IOgCAAAwDwCdASowADAAPm0wlEekIqIhJypIgA2JbADIE4GrGyFF6hAfiDeQc0b+uXuA3gD0AP0A6yj/CTR18PwCrK5T98q/ynGwx4+glnj+j/+17gv60+kB61f2AU8ghqv5VDEPnWiCtKCerhjUovZlsOnmDGCgy1G+qPw6zX3+OBdSi7wAAP7/djt9n/eOGOp06/x6Q/5grH/59JApz7MOrc5eJu6HgPW/XuHxyVTNku17MDK9o7ZVBVhhgrtl/PVhwaFqyrsvnAtD3qlU+iHx6DHmEt13Is2UQjP75uhFfiLzy+QrfIV2FbiAmcskcqfcSvol0+3j7n/KByb19wwk8YHuo5Taq6azrM5DnyqjCl8iUuFx0sGKhcADTl3T/aKH1f3ufGWMBBG36ujpDtkpO9RuZT9Gv3mVFbGlT042B07EgudSSCuzP/jmH8K6aK/nMDURzzqjk4V9tqPWH3mCzMbfjFjw62A1tf+GaL7I8HahvmvLK4hGScGL7P05Sbw60t4pIjzIjMvNQ3R2SMSYZQAbDPNeJquvya6tSBbqj1Cg70KQASONIsNQmidwlxWYARQC+G8xTeVjTDMAafVvCpnhIBj1tHmssIi95r5t/bKS9dUQ1xDSvbto4N4c0cAw9yzpYj1iTjFcxn2llXgKf8HLdMNv9DiqEQup9OkpFf3i0Fg8+QeL3M4A6H2Mc/QUdGap+6V+6/Fq2zBo/iRiJQDqVAQl5TXnLXFJA9nusfY/Q2hSLPBfMVWHM2b3QhO1JRvkUppzmebdY7omwj4suKJV5Tqo5h8XgTFi2oQWdTNyVEAHL3bohxTUjMe4RF0YYAT3PuO9nNCVvEbcfaB+XJqmouetPS3t0e45DO28/MRx6u/SxDkRxLL/FDO1hmnzehB2ijczniu9lBOum+5H2GlNEws9gvlKNN/k2AT3gy7/sinzjmQIuzUKs3pnrAQAIfmoDbUoXw7r89eZz4+g18Yzf7r6enMAAAA=",
  "gatech": "data:image/webp;base64,UklGRtYCAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSPMBAAABkERr2xlJb5xUj23bnpVt27ZtGyt7ZmXbtm3b9kySb1Ff0n9qvIuICcB/RTlWylx50sfXwmImTpQ4VjBSivrzjt5++erB2dX9C4cw8vrl69PVIFIOvfqDvN9sqLqYiDbp4tTqJ13y//FdMDH6vCGh4rTR34h135zdv+/kEzuwVu+JvTemcPxQKE6WZqvfB5PrFoU7a/NK4M3KR4NQZhO7IiH8phoxc8asjqqYzPeZ69nhmbFsmTKlS5UuXbp0meiWzS8DaOkyA+E95ccX0T82GwCmUvjbQj6mkvidBqBtYK4lixh9C3M2XsRIi5jHmf05B9a+InKPnmYurFy1atXmDxz6MnZbf1/KpL5FZNduygyGosiJLxLtNAEUfh1Gp9N79Tp76lCBng6RXaMhMwQA4q04c3amDsBazdDmNB5m3DgxytwnIrumLzlW3LgxEF7iGUOHa8ZggBjNb1P0/Eq9vzD0aVuvEpkTpyncftsXYmoIgjHkM0Pkfnp89d47h3i7pigY7e9zfp1gIOWd/9KX+3z5hDsPHtwt30gYoBUafejZN8exPz09vbhrHsNKkzZtOrMZMxSSAECKlb1inTq1imeJq4BV+q04zlxYOVgVIVDbTN7bjV/dtpiti0SAOnTjOn7j8DhzmkYAFNVbgaVFwv9hAFZQOCC8AAAAUAYAnQEqMAAwAD5hKI1FpCKhGq1WqEAGBLIAZxfvoebS22ru2beXQOQvB7MJTj2H1NKP1plaOhhHlcgA/vHoH//2MnvSWOoE8l21s1zwbxrdX17u/lHxTIMeQlhyVVyDkUfkmF9jS8np5hngOr5E2rC6D16kLnWmgu1dcOuRH/7Jexqu4M0QM4YlY7kz+AjYtSl3/6OgVicFBKRAVCCAsDwJa/PK9Wqg1RFr/O7t/cM06ueOSpqRivPSIAA=",
  "uiuc": "data:image/webp;base64,UklGRq4BAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSDUAAAABR0CQbeMvupzi1YiIEOwMaiJJiu7NzwXpZwIDGEAD/uMRQBTR/wnYB34ucCXV/wFOVVvwBQBWUDggUgEAABALAJ0BKjAAMAA+bTSTSCQioaEjjPiADYlsANNRwC1AfwDeAfwD7ANUBz//oA///QAb1V+gHwZkqK8h/yXv1WBIk75FTmMrVuhpqNxqxYv5eSkVOPpOOy9qdSmctlMCWAAA/v9PiCpp+1zDO9cONVpdxxF9DuPtOejcMU24wU//wtHacXfNEjT//8cR8sK97a54jqgtjcFXKj2072G7pMNNqOUEZ2gpwDoTjvv+c9Pu+kRo5ZG9XcL4voq1BbalvRPOph4IxD93V26Cj9VbG535h0Yskay4lD+p9Z/z6OQd/+oeXiCnw/jlJtQwIfCg/+qr47l9P+SR3j0ufhsogzxW8p9fU0XH/EnZDUQbfLDCcf8iwKX26JxJ3+Kk0FXUsT8NcGRVpZh6ovUkPEtjOf9j+Z25yd9ECALm5wIi3LaoX/6Bo6LEjjdEE6w3oUgAAAAA",
  "tum": "data:image/webp;base64,UklGRvgCAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSOYAAAABgGNr2xrlHZ9ugNbd3V3+Huu9YwXuDougZh9UWknp7i7xfEWSP8GliogJwD9Qd2yC3QCAsARHY92G0J5gNx9Aj+DoXsjknOwWAhgkR8/NzhwZcObM7JpLfw/eKsbaFSIaYaxV4DpsYaxhm4gWGWNdqpUxViKiMiBd59rwAK5lIpoCkKDwpRiqgVy+TT/gXSGiOQDpf0nZAHreVTdjbOFdWX8uilkecW8ZVolo3qARnXMkPwiCUAmkPQi8637AsyQIwiSAtCdB2OPwxSckJAQBV0wCb5QLQGRCQkIEAF98QkKs2+o/J1ZQOCDsAQAAMAwAnQEqMAAwAD5tLJRFpCKiGOs1AEAGxLYAZe6gq28dfp9Mt89PKr2gNtF5gPKA9QHlM9YZ6DXlkeyd/lPNgzS8vwqCImWoXXLf+fKDUQgr67tdiSy9tIOanAD5563cvJh/+6cBrv9+AAD+/7xebBqrb8l2Xo8OUvfGDy1oMyaDyLswHaaQUq1+6Pfs8jmBpbCmMv2aiReP9SnuzcZndp2YCt7nD93rF46kt7MitUHV5vzTzgrSJ397HDrwxcvz9uZ0G/+ytI29HMhiFT94cB1rL86oWSn3zbPzGiz+jPvNS0x7/yM/0AM37KFFV3ZO3cM2/AXk4wS205O6V2Z1QSbkvWHT12pHYwJV+funAaXGi8wIPYAdULpfJ4Nabr5J6lQS7kRCJUDbtSkgHcos/BReRhS1pcpf1q+LutfEsnVQtKRLslqpt9J2Rc+6F3Nf5yOOtcQuerM9WZ25nJxGVtahZHmroVDDePb9nWU+O/9x7sBnYiJkQJ7gtnNTstaFxutxf+bsuCJM+fiRu+264lEqBTzSLYhc7o8TVfPOvWibBUmHC9F8UuUgEhxziK4O+ZCtdX3yTVgUA1nkLPSuq8J33/K8kH7FhL5if876HDJVvhl2FFj3n0W6K0Bu09Wkhl82qmEVKLQEMAAA",
  "hkust": "data:image/webp;base64,UklGRkIFAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSG8CAAABkIVt29lI35+xbdv2rG3btm3btm3btu0dW1u73yJJk5ztWURMAHBrUW3GwrbOBIRKWl4XaTSKD1MdBGIyQ4r0lwMEQYZpkfmSrRB8spDtCCH0QtZ3LfkjK9gVBgtgOztRggDWs8sP5g/6qpQKZvV1cwG4LNi+hXlrPSIAkjx5zkzaWXPamYMQqZRB40aPGjlqzKjmFiBQ73q9hg0f1DaWAM+29oy2djHN21f3tbGzZ6S4qf8lL5fx57Ewiznv8nIZ8yYRLlyfIusnh5C1uC4H1By1gl71D72kpKSkuKSkuOyUnWFGydXSq9XMSK9Ws87Yb3QVc9LCwmkjIiwMA4uFB3qZLD/QDoDEvJHJFfLS9gTAa//Z2uGnT8YAh24/cY9jIa4EAEgb1KZB18YUAMQpcUBdxCZcuH7C7Q5ZuBQAyJjsAcHvz1sBQKwI+9ZGbMQTtQCnJuJXGwHNw8kJuo//x2JE2I+HbQ7ZuNyQVBl24cr6KZ6wfYGXTAwYiPLkLihN44Lag1+dl6C4PgA1958P1gBWt/CNzWb84sYF9EBd+7AKfBEE1HKcHKfN8wKjuTqc6JGF+ylOPL/jXYvpiM8D3T9qmzt+042ipmjwru0s1LUDTslU1E8x2Y7Z/ovxrAUMx+zAhfg0oFoF3rflBhzvoqy7yZTWGeLKZADr67jZY5lv6AcUNQSuYz+jeIKp+TWcRwCgpkjegFR7i+rRhDNI/4DF/v3xjRsAALUS71hvRuUUY+Ax/Mpk/yxFa6B1eYNDop/3o4BXa4vNKD13gvbYd8wKdQK+G8uQ/RaKL8dbOg37X/X5CluyfBn71W2JIQBWUDggrAIAADAPAJ0BKjAAMAA+bS6SRyQiIaEnLJCADYlsAMyRQTlONj1ffCu/uW+cBtgPMd5OXqT9AD9o+sO9B3yxfYz/bP9u/ZpeNGa/EBzNPG59SewL+q/V29Cj9Rmp5WhovDphtodm3h7CxABoh/dgoNdPVNBHk2FqDKgUbKJ7BG+K3bVKGQAA/v2LD/+tP/+ZV//1UE3G3KI7KPGzgda+lf/0uC1Hr+nawivZakCBxhZ54M83IhFCy1ahdBp08u0oxqHebHUQhayOfyki9BLmhpBCPulw3Jc8fc4P+M9bqK6rByuMZJXTjBnbkYd4mv+MTcXNGnHFJgmB/luOA0i9WOt/LeXIYE/c5QnayeCPMNk1C4R2n/5ceDsZ3zHcOFSYkk9LzKvezi1D2/m7hd0LmxCpdv+R5BDrw1zv4xOND0e85ku3Ve7Bd2av748T2rlrGkC3+mxnz45fkg/FESEtudV9MOJgJrR1nGp3poW7zHoNQ/QdvjpR8MWIHktuZ7mEr7GUwts1qBtENibs2WZf1+RqXEBQivj/qvxXY3+4wBgqRC/+HlYP1nhGMcTgHmo0uVAsfFOgB3pyaVATCmCtDvr5ZMm1nlfoaIhM4cU/tZpTUfeZU6MxbvpQg27POq53fYU/Q3FGLg+goKdtf3F2+AfUMn0nYuOgjuwtlF89VyAsx6GPHI6tPtQI4h9iqz6yY2k6HV4WS6WPHUhSDvtl223SnhKBu9ZEonBT3N4xv+bx/0WyCteXu2gyni9dCpPwdvpTO/I9wCqlxcOoED6nk4B/ZFCgVflotc3bCvADBjYjzT7BqHoEijmCR/Zep57ij37cSq1WsXOZsqcgjGbMMcrDvYMQM9LMwD458dA63wmbmxHIMT9QlQTNKfZoNncjfIcEDjGPKH4+hxiX45FgAA==",
  "hku": "data:image/webp;base64,UklGRqIDAABXRUJQVlA4IJYDAAAwEgCdASowADAAPm0ukEakIqGhKqwAgA2JbACdMCH7p+KvKo8Ld8smHqq+oDbAeYD9jeob+N3rGdYn6AH6q9ZZ+4fpO1iNkGR1vgyoDJ3bAehvFn3n0xj+7+hDm+em/YF/W3rPeRmzSw7IzrsyityF+XaAwn7vEBYgcVZd/CZvzt60C2f1g3TPrKU9xtgSyMkwM3aBM+NSZOgAAP7/mGFt62tI8f/wbZ/JvMyVt/BmtPE1C4sAx1BxmH39Ew/azbD/XSc+L6iVrsw0TjcErPVnfICIY+PNjFdTf3X3++UzScgktSFjy+FnbzH3+196+FA/83Xnv13Mydy/bm/NGZwSgrJpWhDmWkxs4Z8BnzCbywyMu5O/01Xxe4CLG+ykr9s2UejHsijfUH6eHRNWVXn0pyLsIvTFWVbMO68IMEfgol8iFfN0vXdPhNnUHMBkI/A0x8FI4QB4ylWq3IQKkNi5A2bINpfUJ3t7ieQwLNMC/VnN15333AYHv+m0zTfOqUP6+fKZHDqDL/BhJw/rzfSW3U4COv6tZrG/Uc6JgqGHxZ35Ij1jXuInVNecGEpshiaGI/ZCgWL5x/1b5TNkGgPG5xHWtznTomiaLG2dOcpJuELGNXDDK/g6I/ONrC9v2ey+PQJ9pqn6KS2RhY0NdrM3Wq8r9aT1G8uewfvjuSw08nq1Mvx62Ml8X0gSrbufSyCYbYmFnuD//Fmujxd51i6bbe91t2ZxbMd9zu18zksyU8ZKTfImoWR6Lf/3BD9BijdnsewIRmSrISCw7k6Za3merpb8gGDE5hA3B6qgdTggkJODQVed6vhnOnccAnjysFJAVrLBtSRucM3Exy97zQ+UuFPH+7sxQroblMePnvRpAv/DV8BZ2R+JoWF6kUE8bqkqJ3GHNw2xtukjt5oBBkikpT/05cX8JcAKtXvHKlHOHKgBgVBz+YFvZTnUu+5bryj22QQ7fVlyEqbKenUl4r9tl+2zHHD/JoTaOXNvogEoRyOBdfeytMkFwfIG46nNW90rJhMfLRu9LdevB+Ko6Zsfjl6wRdtc2rZ7MZ83xP7Z0LZEHyX0SHa9qWM2K9faSHARRcOAsZrR32iCRtN0zlbVnZ5BRWrL/MjbAADvet/mQuSiDiHT9ZNDKrGn8H+nZn+NFM+KjJMVw5y/Q2OALo5yr8kg3lDgef/s6Fi3ygVA3+KnUI8/MYLciUcQoXPEwiObTKY3AAA=",
  "edinburgh": "data:image/webp;base64,UklGRpoEAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSBAAAAABB9CHiAgACeH/ejGi/6kHVlA4IGQEAABwFQCdASowADAAPmksjkWkIqEY7mYAQAaEtIAJ5Q+c+EPeL7/ey2cR+oP3j8veQH0V+SD/G7wRyL+f/7HjA7jH/E+lneDfM/7n7AH5n+kD6TP4b/tf378o/Zf+a/3b/g+4F/Lf6Z/uPzo/wXfz/Z72Y/2Abb5rcdRj4O7iUAM8Ns4tv7c+ooZRraQsmRfPLJPKDTep7ZB3ggJpnHkCFC7x71MwI8gUl+7txL97tcWNX+c8AwAA/v/cB6/5enUk2NIZ5drIMYLsjHB551P6LR/VBz9hm3Q/o7fp6oiIfDRx0DhzSUBq8uwA+Rb3PHRp3CcH98qGvle1tZ/JiO7YXgENSaerD3yKIqf7v+E+99m10Vb66g6UQWzz/tfB3tChqdPqYxovuhLXR3v+9cXMnn/y81nDRm2ttAywZwAZZ4OGeS3nzVMhs73/R+vtOjDchBFz9sWfwDXf64rKSJjzzeYaBFGxpSYdhmai0UDjTI2bchJeKoWr8/+0pf9Mi+0CaiKryIB5UAOIfHLOmyVHsg8dL/nDknvZlEO07wOcACfwODUpi80QcCTijyR6kqhfHG5Pmq/onq5vZ3zRXvYJF+rtSNf91Wg3wcBZjl5C3P3N4VKT+47n+/ykMhDyKTBYukk+xwsWaSy4N1DYyya6ZeDIbIqKjB1bX1RZE1MkEu4c+Sji4Z4q3EF1yTm5L9OMANIoL+muzNspEXadr6cwcsWpD5lh+3cxg/EyriNPwL9m2vTQW2ZdG7A34JT/3f0qwDBrC7wNLcX+n8IcfRcxlhPdGp0j6G1MDqn++T7r2M70tlYqjPedQ38PNfX5JJkSRK/LMmYCAKwzxMfQW6F/DK6w4MIAaIUGaPQ/v1PnOtDu+S+F80HQRdeA+lP47r7+lTfOck2W7DeQpDymZEvZU3JC8MR1ylyj4/imJOa3LU1ypz9f/9kH1PCbqzpjMMQOxQ46/8+2aYLSAS/IWItiY0lEk739hfYkKTM/50TzBCKO6+h5zmRtgrGQHL9L0cc+2v3eRGP4if/43ArdSP5UqOWabwke9P7hFNAZ2Hw+hhykoQbo1POYYmw/hq7hpBAUPS/XPwCz9ukxZdxSDI1ewoUrolTfyA2Wm0xMQOm6C1W6H34C6euwZu/+F42uArZbzzW5xatWB7lWZ16Z7Z3nTOvhqlAHLY9k3v8EFNMxrU+XVS4fafnxZ/vdIVD6oYsP9QxZuZsOsDxeIeMG0eV3sJz95u0pUkYm83skibckxomVtiHz+1WWoRX1md/nXrH7vsIc6d+WY/wquK34OLBDs5yghBkRjMuyeTz3JaZPploK62NQ7O8xjv1DBIJD6lLndttzOAffjZlQ8pJnivLk1HKj/MwwMYraFUV00eXpw4bj9FN9tCt9/edZSjMdidO4QjI/B+KJKHWx5wfzOz1LeGsx0eDgfT6xM8l6af+E/jbTIS8MYUcDUUBCVdP9K/yaWbJ/RkT46jM0+9wIJKoqW++E0AAAAA==",
  "tudelft": "data:image/webp;base64,UklGRpQCAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSEQCAAABkHTb1iHJ8m8hMrOqbdu2bdu2zZFtjWzbtm3btruTd5DxvvgiImIC4PBspZ228JjDWvh6O6vXv48pnJRiETkYzvV0eESuNhyTqMMFkuviwJnuUjOekORsF5yYrOasG0GS/NYF9icoPWz3W5pfKAqbXQX6bnoWohiYFR+2eirNuO6l6uP6sDX76Bu0uC4N7Cy29Dst/uwbARuLrvtHq3fKwMZM8//S8qE00G/0f0frW+NDf+4D1HgwLvS3+kA5JD1PB+2RY4KU55yUukK7MY+K5+NdF14l1ha9iIq/i+b0CkehfRoVg10xiVoS9fYodKFiYABSvpUex1HIcPKBW8r3TeFne2AW5WB9qcETToIYfYDywwpA6b8KfFwkLKL42iD9JaXmlHekA+JeovL3lQP6TD/tJXneENwXhf8jDACTqbs7xBohsxe1AaDMP13PEknLaHo6GwAYR6h7KMT4z0w2J0R4xaDC8ntKjxJJxQNhazwwHU/5UeLzSh0hDyTJfbEwny35anteqhw2FI6SfJIGYgvB1wv5vAo/C0HxGxlqBjnOWZMXTYCWVBwO1RB5PEoBWfb++v9wShoAcxX2uJT+ku2gHJEtdzwAMC5LT9JD+Ra/pVOTC/4XfpSD+mxejtIzkebelrBYl7uhNelLs0APWM3q36pnPE19PWHZ/XSHllK/TX60hsatO3Wku8fwB+Whs+ssDekuMHxtGmiNSWyt0E2SvNsKDk057AvJu4MSwZnG6A/8d3dJ/bhwqtGmY+XssbATVlA4ICoAAAAwAwCdASowADAAPm02mEikIyKhI4gAgA2JaQAAG4G9Pg4AAP77nMAAAAA=",
  "waterloo": "data:image/webp;base64,UklGRpoDAABXRUJQVlA4II4DAABwEQCdASowADAAPm0qkUYkIiGhLjgMyIANiWwAuy/oeO/KB0+O7sTd4GMB4j3Sr8wHnVegDeE/2A9gDpHv3BmuD2nIC/xFcDqU/qXEBpJsLH2Sf4jxX/O3/f/tnwCfq3/xOwJ+3fsqpQsNlFhhoIrZJ/X9ut9bMaBquOCnK7fUh/5vJe2lkFoyIbt2F+iAR5EsIAAAAP7/MmvSvbB95/l+U27V0HQDQzmjK9hq9pkfDbcJM7LevINiz/v5QS54kAEUmPOn/UG5xsXrwOFx8No+2uj4K1/U7t79ocSjiDuAYk7k/eZivpecfyHzpI1iHnjTwBus16szRiBp8QEikeUEBkf6ZXdDWvHQNlF9m6oP+42dH+QNUIpsIBNFMkTnnG1J+ktdBC8JM6Rjl2inzs9YcfJYFjPeMuqIz8nB5+DIvacuSW5j0GXfclHJYfsr+QU+XgVj3mtFNTPNV8y8UdjAhmTYTULFm0HzssAOFrfAFZVfer2PcP/wKiGaZe3vzCnP4t3EoFknTHWJ9KTburpDatMXisGBoITrn7ZQEVANsbOxJeF35e3RkhLoLrH1ul586vctfE9vpnfEtjyX4MwQDz/8IDoOpn+DX4flZN2VgYothAMWpH4b42eCUCnFaitabw6gIAzimxnAQU6JUISyS7kD60TeIwkzlb+D136nLPHMla9LRGzulB+etoByGyXtbpU9Q1F6e2uozDINL3xXh8YV1UiH59Spu6f2H3CgyQNfApMcMn4RILT0tGzegD5edZKfISDU/GT/tCST2PLzgEM4m/qxVc86sx2RDp7tO1ZaBXrhHh+sStME/G/YTqFInXSgGOQLQV3razYfBXuaEJ49VeQjbIyZNgTwPGG33vrEDbylR3Y3spsckFLRL9AAQQnHd89NvL7yyUXjQHeI/K72s/US/xsyfeCEwLbwtKa96+wx/372797l2rHfbbM8L8nEOvBExRX8iqkjMWeJW+7WEY1TSi1zglPmlHT85fmMe2LXtDypkyTPIKYuP+b4PhpMPravTpE2mGhZrwP9E40lV2A8wbzYvHYUlRGrXOiGRS7DCAzWmf1upShdZYZn/3yxA7tIfefWtj8t4wEUE1sHPvqnXfrX8sy8/YQ0zDP9cLZmvJQ7FqDWwnqrf99OoT8ooOlTW1Mn4qwt7naRcWQfrNQKQ5lNEHTmh4w3W8/8/y5k5MKIwNYRtWAA",
  "bu": "data:image/webp;base64,UklGRkICAABXRUJQVlA4IDYCAABQDACdASowADAAPm00lEikIqIhI4oAgA2JbADNvUF+AdC0ZN6naCcYfJnkALtm9ADpK/3IsHDvK+6zR21BYyfNt0cfPHsEfxz+ib4AoFhycCFAagyWNfLtFE8AB8/sQEEiwMuimgSX8i6mZAD+/zJVm+FzYe6/a64fRbxzP92dD14ubbZWMjvH7n/z/r//3YjXu/tdgnH57+if/Mel2/Sf+6t/uvAMgMlsRqAZAZ0CzTGF8CFe4pTlfgZTphvCgpMG8++L/+B/+Mcpk7Ui3HKvgATvpqstV6zB9wiL6Y/0cWXZZCnkgB0FCTwp13FQhzvM8z85ojcawj/3UIu58AfYKug/vkwidUsjeO9DmpaGFhee9ffxwYzu4/6rua6N/jP/Ofvj/rbtHnAVbp4Xo3+J5uNBaC4EuTKDhp33MrfWpKCPYy6Lc1DMOmrsv4OS9+grba3dhbZ61QwPmXL5grf34uy9TQFUvyr2Hf5fJwbtZqhanZK7N3nDqunuRGU8EWS8CkAsTcysHaPOBPILArowilYzmRnvvcHM1kc5V9d+CNdP6yjhYsJDUD+F4THfmyQRZkxPK2RYD+IMOW7HvMfoAWb7XIU3g5ABBqljJ1RdVKLhFjAVBtSkPLEv4qTAfQXCsFjdOowMHxTXqslzLJrh/yp34TZ/jy+2qg6NsnXA6DICCUX59QP/me6/YC3+Pr8mWekLnoZ7Ry23v/8TCl0LN/QUDZ5LA/tDhn1/TXEHeCsQ/gAAAA==",
  "wisc": "data:image/webp;base64,UklGRigDAABXRUJQVlA4WAoAAAAQAAAALwAALwAAQUxQSCwAAAABP0CkbZuT8MHBSXtExGFaBsOQrSh9ha/wK4UU8r89gE4R/Z8ADe2lc/TfAFZQOCDWAgAAUA8AnQEqMAAwAD5pKpFFpCKhlVdUQAaEtgCDAP0AqPMqth/D/jBzXvO0BB4DbO8zt6nvI560/0Ov2d9ML2gPJVu5v6hz4fhk9o/J5yq2ztQJVFmEeZ5pDi4/+cBhYG9DrwtcXv30Z+RviGfohbAa7vHoWqpmRjkXm1ZIEWherxw3XPQA/vtmRM13fh444ppXtr9zfMutVjGv06cQW/Y8PIiX9VXxOgTfptN+Zuq9KY/9tMjq1ar/8gH4HRR1RRwlv/y0LZ6n2AfzQT8Ly0Kx/ZP8T4LE84h8ZSv4cn8DaYXMHByPMJhZFcYbLBjPPM26yInaw+tA0n+q3x3LZ2IAp9j+DDBsE4iPLkg+cPCRwoytNKG9T32PlJ7/9IcfNyu4vL1hN4ELBxXB/8KWwSJ9tOd9PSVWF+q2aVPt5dLh9mZPCUG63zaq5mHv3miv0qHC2X5cWUEm1FO0j+IzX+clbR8WVXippY/5nHHVLMi6JX+eUIFDY5XJLB0n0bQ9xgt5hfFIAKSfehMlS+i1D2x//+SZ/8YXK/EehgbFkmNDB5pEYuMmkoNb4Bihsvjfa2S36XSDZNzHaUzZ8X7aQCaS3007OaRqyNgPX9gLW1i9nLS8kqrT6BWWK9g1csKk6aaSkTJU+gnCNYwDxhvkfMJn//I9diE6MYuHfqNPkPZ2FquR/9Wrl4VqNEGFDkmAp+JzNqeOUOjtZm+mG2juYDkr6vYMe3pBlDtplkLIVPePjgYAEASHUhD/7oYn6YQylS/TPOVwa+m+TTn//w116/yd/sA+8NY3OcjpNGdzIkpQTcO2ttGIs2EQyLZk17nVug/jk9ZjyoAl+m/DbiwJ48bxzgwwnuPaSNm//uXiR/R3UW7b695Z/9JI0umun1CkhkN0YWeDbbK5eoPqT7yHXm9zHeB2dW/plgwlZj4wJyLo6nrLO97tSvESop6r/5mUOj/rfNY4gAAA",
  "uw": "data:image/webp;base64,UklGRpoBAABXRUJQVlA4II4BAACwCQCdASowADAAPm0ulEekIiIhJzgLaIANiUAY1+93nSPCB7zupbvYhFc6f0JPWhhpiONsMfWNabL08diKCfHkGC7F+0ipNqOMFRjXhFM410jvQhEpkAD++9l/oww0n7Z2BLM4DUk+FobZUZKuKkBn+wBNL/JLvw6Ic28GSWERuAoGOlzwh3/Fg+EwLOzCua6S11lh/FQvD0f0PjBZVqqFtMvPjsANzfuXmrFEB3UOrP2E0AHgx9i+l0oUjrrkiS8Vly2ehUH6qoU+WvV6rYKySj26nJbpVzHj6+bqb8eUjEHcQLatBRBfkIsR2/HlHoMqu12Vpe3Uugf87Bn9qVJ3rMzwaMFCQwymP4/MhHE/TNw8LF83HCZdpAcG+VjicyjQVAZn93PfFA5eN0H9E6RgD+5cg9XeyJ2a0uX0pCCGivPaWutJMe3Y7gEqRiRmXaZzt334YI0Juu19NeEVsuzPrCjcYKllhx2rTh4Z8Ih0+BPhcnCLd/vfFkO7g10pztqoFkOF2DU/OzJMigAAAA==",
  "nyu": "data:image/webp;base64,UklGRhgBAABXRUJQVlA4IAwBAAAQBwCdASowADAAPmEojkWkIqEcbbQAQAYEsYBnFgNA/P4Q9aGL3rcuiwTD8oPTkA45XE2w2rdR/r82x3HhoJcdgAD++bxfV8UVeHUZ9pM3A/6u+IPHzCoAICNYFW634Qveud2Gkc4LysYzpR88e6GXF5oGx3OB8qimtm6YebgaXBnMx2QmSSqa8CG6JeRG3wL7diGlaGIsXaHxbkFi6NFADHvU8KNNvSinP8c5+NysZdnT/CRf97NDf+q8y7q8IIMeUJIGfNsekygWlVZI3SO4gd+8WAxoOiDY4Eq6Pyhj9j2evg751HUZDvPoXE8C92+jXjRgarZ7ICWqHf3huT43KqYnrWKpv9waagAA",
  "tamu": "data:image/webp;base64,UklGRiADAABXRUJQVlA4IBQDAACQEQCdASowADAAPm0wl0gkIqIhJzgJIIANiWoAsSVBUx5A/a/MhqkPo+KTvTPUk+gB0vlYz6GvyH7DZM16V+VWfF31zDe4Aeo7+V/2b7LecG7y833+4+1X6Qf4D/teXr6e9GHfOVAsM9f71GU3DXg5XYUuiaqWV+z3XhDCOkCPmw9WzZkWt6VCFYe8VNpLUuPdfb6AQAD+/uHeeiOrSn/xF2join0H6+ollDC1nzvOZUA8XcbpX3AacTa/Sj9mpTyEFPlv1bH9/ln4wlOycYmzCtZcAVxzsZ0SSDhYgGdSLX273Kr8inTOFKOyXfxylT5vkB/ovpW0Qe1kF2EY8TGppN3zrWK48PEKyklO7f2EXxoVOqpzp0fuc7fGftRDLvcwSmDy53lR8DT1HR3xugiUkfRapbRycXZzDQNk+gHF0BcbVYA/MkHVqkcqjBPxvpViTAJLUefxvVIVZ+STAm/w3DhxfJhyIeX13c+kSi1u6fkG+K/XVFagj9AJn5B7vkhrYupPYgPNkGuVNq4Xvrz+Rdf8vmKKqBx/jnCaNWSH5ePBOjWQxc3vwG1wrWj1qEVzmmdwxjtZ1HaIr7F+6D4Iyf8wxHRhP4hAL6Y7UZVEPEo6+ozikEv22/xWa+B6O/VctemoGuVFHmPDx9w8EhUiR6cz7gucoaZBkZjBAKOsYz//Ir/C7tJGXSI0a1z8bZBi+xqsN9oAbtK6rWXN5qMsU4bNXmYVdM0hZ528ZLixQE3YtgFIb4ZdUrTpmUsM6NBARGCpAr0q4fIPuyQgbTMjtYznQ2BtVHCs+Fyw/YxISrcUDvMcz+qN6J5aW9ttlTw/mYdcNBhL0uDw6CV1SSsH9kGFb93i1+rPQIWBZuhyBSqRAaUhm3DBfAirnc2NLn0PIQFC26hmfNxWXOvETIQ/yCo/5iAmvZALY/39KjP5w06+xf+8nl0J06CnxhDggtKZy0cCFTiRUX7lpmllt4vr+kaVie9tV4blZjYL76YaPsgLtPwuECP9DH8PXHPxxeVjmEYZxi7BKHtRxobF9QPxsMAAAA==",
  "neu": "data:image/webp;base64,UklGRjICAABXRUJQVlA4ICYCAACwCwCdASowADAAPm02l0kkIqIhI4gAgA2JbAC428xKr6bTJ8ADbAeYDHafQA6Sr9vv2Z9o5y5Z9muQTJ3kodUk/EHQ0UiagY+EjkW0P0VeqaJHQ6lRo1QiuiQHZwAPsR9gACPIeDAA/v8SEn9ks4bb+mxdvq5hxXVunWVRHehjpvIFX6ZXEbnHE3S+U0ndZ3u7xVyi6pER0QNNfll8JBV87/sxWf/vl7ySbhsw3szQQx1hnmfcgsl0sA1jIXFjfOL+/pj3p+3Ehob+7rnmPRe/4jQtRaO36aeP8/xTlrSk5xWapJzvtNyu9o42T/976L8w2okcWrUbnwPJv86vbqmibAli/iwk2CncC/+4Bof3tRzWIqH+dJdSTkvwS0hzOf+s16TcRH5/5JZlijJU5BzBUma+MdKucPsGCvjnfDl21hLtiBD8b0/5Ikf2H/9sFakfkyhDhS9ES/wwIZ4AMTolgytV0AgH7EjH+4e/dzyjBTAo18hK52q2xlcwS0dRgq5rxBq99t/+MC943oJS0bzbKJSX/9AOFgSZxrO4na0alhDb/OB8LsMhj6F/qsJaK5PUQkkivtTuyEoL8lv/uVbS9pxTVZ3811mgG7yMEUTRQPqW7U81/Uk8kD+/y69/hJ5WhvvnDRNS8hgzc/5vsopmUW21aseDXj1d1PpaQqLu3+/yxrsFCd+yclvpQ8/7TrLbWShBDOV+0+48fetoJxDBcwBsAAAA",
};

const STORAGE_KEY = "interactive-school-list-cache-v1";

const elements = {
  board: document.querySelector("#tier-board"),
  tierTemplate: document.querySelector("#tier-template"),
  programTemplate: document.querySelector("#program-template"),
  unlockButton: document.querySelector("#unlock-button"),
  trashButton: document.querySelector("#trash-button"),
  modal: document.querySelector("#program-modal"),
  modalTitle: document.querySelector("#modal-title"),
  closeModalButtons: document.querySelectorAll("[data-close-modal='true'], #modal-close"),
  form: document.querySelector("#program-form"),
  submitButton: document.querySelector("#submit-button"),
  deleteButton: document.querySelector("#delete-button"),
  purgeButton: document.querySelector("#purge-button"),
  shortNameInput: document.querySelector("#program-short-name"),
  schoolSearchInput: document.querySelector("#program-school-search"),
  schoolSelect: document.querySelector("#program-school"),
  cnNameInput: document.querySelector("#program-cn-name"),
  enNameInput: document.querySelector("#program-en-name"),
  durationSelect: document.querySelector("#program-duration"),
  statusSelect: document.querySelector("#program-status"),
  websiteInput: document.querySelector("#program-website"),
  ddlInput: document.querySelector("#program-ddl"),
  greInput: document.querySelector("#program-gre"),
  langInput: document.querySelector("#program-lang"),
  recInput: document.querySelector("#program-rec"),
  otherInput: document.querySelector("#program-other"),
  saveStatus: document.querySelector("#save-status"),
  programCount: document.querySelector("#program-count"),
  modalLogo: document.querySelector("#modal-school-logo"),
  modalLogoPlaceholder: document.querySelector("#modal-logo-placeholder"),
  unlockModal: document.querySelector("#unlock-modal"),
  unlockCloseButtons: document.querySelectorAll("[data-close-unlock-modal='true'], #unlock-modal-close"),
  unlockForm: document.querySelector("#unlock-form"),
  unlockPasswordInput: document.querySelector("#unlock-password"),
  unlockError: document.querySelector("#unlock-error"),
  trashModal: document.querySelector("#trash-modal"),
  trashCloseButtons: document.querySelectorAll("[data-close-trash-modal='true'], #trash-modal-close"),
  trashBoard: document.querySelector("#trash-board"),
  trashCount: document.querySelector("#trash-count"),
  readModal: document.querySelector("#read-modal"),
  readCloseButtons: document.querySelectorAll("[data-close-read-modal='true'], #read-modal-close"),
  readWebsite: document.querySelector("#read-website"),
  readDdl: document.querySelector("#read-ddl"),
  readGre: document.querySelector("#read-gre"),
  readLang: document.querySelector("#read-lang"),
  readRec: document.querySelector("#read-rec"),
  readOther: document.querySelector("#read-other")
};

const schoolMap = new Map(SCHOOL_OPTIONS.map((school) => [school.id, school]));

const state = {
  programs: [],
  modalMode: "edit",
  activeProgramId: null,
  activeTierId: null,
  saveTimer: null,
  saveStatusTimer: null,
  draggedProgramId: null,
  dropHappened: false,
  syncing: false,
  isUnlocked: false,
  authToken: null,
  modalContext: "active"
};

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {
  populateSchoolOptions();
  bindModalEvents();
  bindFormEvents();
  bindUnlockEvents();
  bindTrashEvents();

  state.programs = normalizePrograms(loadLocalCache());
  renderBoard();

  if (!isGithubConfigured()) {
    hideSaveStatus();
    return;
  }

  const remotePrograms = await loadFromGithubIssues();
  if (remotePrograms) {
    state.programs = normalizePrograms(remotePrograms);
    saveLocalCache(state.programs);
    renderBoard();
    hideSaveStatus();
  } else {
    setSaveStatus("GitHub 数据加载失败，已回退到本地缓存", "error");
  }
}

function populateSchoolOptions() {
  syncSchoolOptions("", elements.schoolSelect.value || SCHOOL_OPTIONS[0].id);
}

function syncSchoolOptions(query = "", preferredSchoolId = "") {
  const normalizedQuery = normalizeSchoolSearchQuery(query);
  const filteredSchools = getFilteredSchoolOptions(normalizedQuery);
  const fragment = document.createDocumentFragment();

  filteredSchools.forEach((school) => {
    const option = document.createElement("option");
    option.value = school.id;
    option.textContent = `${school.short} | ${school.cn}`;
    fragment.appendChild(option);
  });

  elements.schoolSelect.innerHTML = "";

  if (filteredSchools.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No matching schools";
    option.disabled = true;
    option.selected = true;
    elements.schoolSelect.appendChild(option);
    elements.schoolSelect.disabled = true;
    return;
  }

  elements.schoolSelect.disabled = false;
  elements.schoolSelect.appendChild(fragment);

  const nextSchoolId = filteredSchools.some((school) => school.id === preferredSchoolId)
    ? preferredSchoolId
    : filteredSchools[0].id;
  elements.schoolSelect.value = nextSchoolId;
}

function getFilteredSchoolOptions(query) {
  if (!query) {
    return SCHOOL_OPTIONS;
  }

  return SCHOOL_OPTIONS.filter((school) => {
    const keywords = [school.short, school.en].map((value) => String(value || "").toLowerCase());
    return keywords.some((value) => value.includes(query));
  });
}

function normalizeSchoolSearchQuery(value) {
  return String(value || "").trim().toLowerCase();
}

function bindModalEvents() {
  elements.closeModalButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  elements.readCloseButtons.forEach((button) => {
    button.addEventListener("click", closeReadModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.modal.classList.contains("hidden")) {
      closeModal();
    }

    if (event.key === "Escape" && !elements.unlockModal.classList.contains("hidden")) {
      closeUnlockModal();
    }

    if (event.key === "Escape" && !elements.readModal.classList.contains("hidden")) {
      closeReadModal();
    }

    if (event.key === "Escape" && !elements.trashModal.classList.contains("hidden")) {
      closeTrashModal();
    }
  });
}

function bindFormEvents() {
  elements.schoolSearchInput.addEventListener("input", () => {
    const currentSelectedId = elements.schoolSelect.value;
    syncSchoolOptions(elements.schoolSearchInput.value, currentSelectedId);
    updateModalSchoolPreview();
  });

  elements.schoolSelect.addEventListener("change", updateModalSchoolPreview);

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();

    const payload = {
      shortName: elements.shortNameInput.value.trim(),
      schoolId: elements.schoolSelect.value,
      cnName: elements.cnNameInput.value.trim(),
      enName: elements.enNameInput.value.trim(),
      duration: elements.durationSelect.value,
      selectedStatus: elements.statusSelect.value,
      websiteUrl: elements.websiteInput.value.trim(),
      ddlTime: elements.ddlInput.value.trim(),
      greRequirement: elements.greInput.value.trim(),
      languageRequirement: elements.langInput.value.trim(),
      recommendationRequirement: elements.recInput.value.trim(),
      otherRequirements: elements.otherInput.value.trim()
    };

    if (!payload.shortName || !payload.schoolId || !payload.cnName || !payload.enName || !payload.selectedStatus) {
      return;
    }

    if (state.modalMode === "create") {
      const statusHistory = buildNextStatusHistory([], payload.selectedStatus);

      state.programs.push(
        normalizeProgram({
          id: createId(),
          tierId: state.activeTierId,
          shortName: payload.shortName,
          schoolId: payload.schoolId,
          cnName: payload.cnName,
          enName: payload.enName,
          duration: payload.duration,
          websiteUrl: payload.websiteUrl,
          ddlTime: payload.ddlTime,
          greRequirement: payload.greRequirement,
          languageRequirement: payload.languageRequirement,
          recommendationRequirement: payload.recommendationRequirement,
          otherRequirements: payload.otherRequirements,
          shown: 1,
          statusHistory
        })
      );
      renderBoard();
      scheduleSave("create", 120);
    } else {
      state.programs = state.programs.map((program) => {
        if (program.id !== state.activeProgramId) {
          return program;
        }

        return normalizeProgram({
          ...program,
          shortName: payload.shortName,
          schoolId: payload.schoolId,
          cnName: payload.cnName,
          enName: payload.enName,
          duration: payload.duration,
          websiteUrl: payload.websiteUrl,
          ddlTime: payload.ddlTime,
          greRequirement: payload.greRequirement,
          languageRequirement: payload.languageRequirement,
          recommendationRequirement: payload.recommendationRequirement,
          otherRequirements: payload.otherRequirements,
          statusHistory: buildNextStatusHistory(program.statusHistory, payload.selectedStatus)
        });
      });
      renderBoard();
      scheduleSave("edit", 120);
    }

    closeModal();
  });

  elements.deleteButton.addEventListener("click", () => {
    if (!state.activeProgramId) {
      return;
    }

    const nextShown = state.modalContext === "trash" ? 1 : 0;

    state.programs = state.programs.map((program) => {
      if (program.id !== state.activeProgramId) {
        return program;
      }

      return normalizeProgram({
        ...program,
        shown: nextShown
      });
    });
    renderBoard();
    closeModal();
    scheduleSave(state.modalContext === "trash" ? "restore" : "delete", 120);
  });

  elements.purgeButton.addEventListener("click", () => {
    if (!state.activeProgramId || state.modalContext !== "trash") {
      return;
    }

    const confirmed = window.confirm("永久删除后将无法从回收站恢复，确定继续吗？");
    if (!confirmed) {
      return;
    }

    state.programs = state.programs.filter((program) => program.id !== state.activeProgramId);
    renderBoard();
    closeModal();
    scheduleSave("purge", 120);
  });
}

function bindUnlockEvents() {
  elements.unlockButton.addEventListener("click", openUnlockModal);

  elements.unlockCloseButtons.forEach((button) => {
    button.addEventListener("click", closeUnlockModal);
  });

  elements.unlockForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setUnlockError("");

    const password = elements.unlockPasswordInput.value;
    if (!password) {
      setUnlockError("请输入密码。");
      return;
    }

    try {
      const sha256 = await sha256Hex(password);
      
      const response = await fetch(`${WORKER_URL}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordSha256: sha256 })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        setUnlockError("密码错误。");
        return;
      }

      state.authToken = sha256;
      state.isUnlocked = true;
      updateUnlockButtonState();
      closeUnlockModal();
      renderBoard();
      setSaveStatus("已登陆", "success");
    } catch (error) {
      setUnlockError("登陆验证请求失败。");
    }
  });
}

function bindTrashEvents() {
  elements.trashButton.addEventListener("click", openTrashModal);

  elements.trashCloseButtons.forEach((button) => {
    button.addEventListener("click", closeTrashModal);
  });
}

function renderBoard() {
  updateUnlockButtonState();
  updateProgramCount();
  renderProgramBoard({
    container: elements.board,
    shownValue: 1,
    allowCreate: true,
    emptyMessage: "拖拽项目到这里，或点击右上角新建",
    lockedEmptyMessage: "当前为冻结模式，悬停右侧点击⚙️并输入密码后解锁",
    editContext: "active"
  });
  renderTrashBoard();
}

function updateProgramCount() {
  const count = Array.isArray(state.programs)
    ? state.programs.filter((program) => program.shown === 1).length
    : 0;
  elements.programCount.textContent = `${count} Programs In Total`;
}

function updateTrashCount() {
  const count = Array.isArray(state.programs)
    ? state.programs.filter((program) => program.shown === 0).length
    : 0;
  elements.trashCount.textContent = `${count} Programs In Trash`;
}

function renderTrashBoard() {
  updateTrashCount();
  renderProgramBoard({
    container: elements.trashBoard,
    shownValue: 0,
    allowCreate: false,
    emptyMessage: "回收站里还没有项目",
    lockedEmptyMessage: "登录后可查看回收站项目",
    editContext: "trash"
  });
}

function renderProgramBoard({ container, shownValue, allowCreate, emptyMessage, lockedEmptyMessage, editContext }) {
  if (!container) {
    return;
  }

  container.innerHTML = "";

  TIER_DEFINITIONS.forEach((tier) => {
    const tierNode = elements.tierTemplate.content.firstElementChild.cloneNode(true);
    const title = tierNode.querySelector(".tier-title");
    const subtitle = tierNode.querySelector(".tier-subtitle");
    const addButton = tierNode.querySelector(".tier-add-button");
    const list = tierNode.querySelector(".tier-list");

    title.textContent = tier.label;
    subtitle.textContent = tier.subtitle || "";
    list.dataset.tierId = tier.id;
    list.dataset.locked = state.isUnlocked ? "false" : "true";
    list.dataset.emptyMessage = emptyMessage;
    list.dataset.lockedEmptyMessage = lockedEmptyMessage || emptyMessage;
    tierNode.classList.toggle("is-locked", !state.isUnlocked);
    addButton.hidden = !state.isUnlocked || !allowCreate;

    if (state.isUnlocked && allowCreate) {
      addButton.addEventListener("click", () => openCreateModal(tier.id));
    }

    if (state.isUnlocked) {
      wireTierListDnD(list, container, shownValue);
    }

    const programs = getProgramsByTier(tier.id, shownValue);
    list.classList.toggle("empty", programs.length === 0);

    programs.forEach((program) => {
      const cardNode = createProgramCard(program, editContext);
      list.appendChild(cardNode);
    });

    tierNode.dataset.tierId = tier.id;
    container.appendChild(tierNode);
  });
}

function createProgramCard(program, editContext) {
  const cardNode = elements.programTemplate.content.firstElementChild.cloneNode(true);
  const school = getSchoolById(program.schoolId);

  cardNode.dataset.programId = program.id;
  cardNode.dataset.tierId = program.tierId;
  cardNode.draggable = state.isUnlocked;
  cardNode.classList.toggle("is-locked", !state.isUnlocked);

  cardNode.querySelector(".program-short-name").textContent = program.shortName;
  cardNode.querySelector(".program-school-name").textContent = `@ ${school.short} ${school.cn}`;
  cardNode.querySelector(".program-subtitle").textContent = school.en;
  cardNode.querySelector(".program-cn-name").textContent = program.cnName;
  cardNode.querySelector(".program-en-name").textContent = program.enName;
  cardNode.querySelector(".program-status-text").textContent = getCurrentStatusLabel(program);

  const rankingsContainer = cardNode.querySelector(".program-rankings");
  const qsNode = cardNode.querySelector(".qs-ranking");
  const usnNode = cardNode.querySelector(".usnews-ranking");
  const csNode = cardNode.querySelector(".cs-ranking");
  const durationBadge = cardNode.querySelector(".duration-badge");

  if (program.duration) {
    durationBadge.textContent = program.duration;
    durationBadge.className = "ranking-badge duration-badge";
    if (program.duration === "1 year") {
      durationBadge.classList.add("duration-1");
    } else if (program.duration === "1.5 year") {
      durationBadge.classList.add("duration-1-5");
    } else if (program.duration === "2 year") {
      durationBadge.classList.add("duration-2");
    }
    durationBadge.hidden = false;
  } else {
    durationBadge.hidden = true;
  }

  const rankings = [
    { node: qsNode, rank: school.qs || Infinity },
    { node: usnNode, rank: school.usNews || Infinity },
    { node: csNode, rank: school.cs || Infinity }
  ];

  rankings.sort((a, b) => a.rank - b.rank);
  rankings.forEach((item) => {
    rankingsContainer.appendChild(item.node);
  });

  if (school.usNews) {
    usnNode.hidden = false;
    usnNode.querySelector(".usnews-value").textContent = school.usNews;
  }
  if (school.qs) {
    qsNode.hidden = false;
    qsNode.querySelector(".qs-value").textContent = school.qs;
  }
  if (school.cs) {
    csNode.hidden = false;
    csNode.querySelector(".cs-value").textContent = school.cs;
  }

  const ddlDisplay = cardNode.querySelector(".program-ddl-display");
  if (program.ddlTime) {
    cardNode.querySelector(".program-ddl-value").textContent = program.ddlTime;
    ddlDisplay.hidden = false;
  } else {
    ddlDisplay.hidden = true;
  }

  const progressNode = cardNode.querySelector(".program-progress");
  renderStatusProgress(progressNode, program);

  cardNode.addEventListener("click", () => {
    if (state.isUnlocked) {
      openEditModal(program.id, editContext);
    } else {
      openReadModal(program.id);
    }
  });

  if (state.isUnlocked) {
    wireProgramDnD(cardNode);
  }

  const logo = cardNode.querySelector(".school-logo");
  const placeholder = cardNode.querySelector(".logo-placeholder");
  loadSchoolLogo(logo, placeholder, school);

  return cardNode;
}

function renderStatusProgress(progressNode, program) {
  progressNode.innerHTML = "";

  const segments = getProgressSegments(program);
  segments.forEach((segment) => {
    const segmentNode = document.createElement("span");
    segmentNode.className = `program-progress-segment ${segment.colorClass}`;
    if (segment.title) {
      segmentNode.title = segment.title;
    }
    progressNode.appendChild(segmentNode);
  });
}

function wireProgramDnD(cardNode) {
  cardNode.addEventListener("dragstart", (event) => {
    state.draggedProgramId = cardNode.dataset.programId;
    state.dropHappened = false;
    cardNode.classList.add("dragging");

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", state.draggedProgramId);
    }
  });

  cardNode.addEventListener("dragend", () => {
    cardNode.classList.remove("dragging");
    clearTierDropState();

    if (!state.dropHappened) {
      renderBoard();
    }

    state.draggedProgramId = null;
    state.dropHappened = false;
  });
}

function wireTierListDnD(list, boardRoot, shownValue) {
  list.addEventListener("dragover", (event) => {
    event.preventDefault();
    const draggingCard = document.querySelector(".program-card.dragging");

    if (!draggingCard) {
      return;
    }

    list.closest(".tier-column").classList.add("drag-target");

    const nextCard = getDragAfterElement(list, event.clientY);
    if (!nextCard) {
      list.appendChild(draggingCard);
    } else if (nextCard !== draggingCard) {
      list.insertBefore(draggingCard, nextCard);
    }
  });

  list.addEventListener("drop", (event) => {
    event.preventDefault();
    const didChange = syncProgramsFromDom(boardRoot, shownValue);

      draggedProgramId: state.draggedProgramId,
      targetTierId: list.dataset.tierId,
      didChange
    });

    clearTierDropState();
    state.dropHappened = true;
    renderBoard();

    if (didChange) {
      scheduleSave("drag", 0);
    }
  });

  list.addEventListener("dragleave", (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      list.closest(".tier-column").classList.remove("drag-target");
    }
  });
}

function getDragAfterElement(list, mouseY) {
  const nonDraggingCards = [...list.querySelectorAll(".program-card:not(.dragging)")];

  return nonDraggingCards.reduce(
    (closest, card) => {
      const box = card.getBoundingClientRect();
      const offset = mouseY - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset, element: card };
      }

      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: null }
  ).element;
}

function syncProgramsFromDom(boardRoot, shownValue) {
  const currentSubset = state.programs
    .filter((program) => program.shown === shownValue)
    .map((program) => normalizeProgram(program));

  const previous = JSON.stringify(
    currentSubset.map((program) => ({
      id: program.id,
      tierId: program.tierId
    }))
  );

  const programMap = new Map(currentSubset.map((program) => [program.id, program]));
  const nextPrograms = [];

  boardRoot.querySelectorAll(".tier-list").forEach((list) => {
    const tierId = list.dataset.tierId;
    list.querySelectorAll(".program-card").forEach((card) => {
      const program = programMap.get(card.dataset.programId);
      if (!program) {
        return;
      }

      program.tierId = tierId;
      nextPrograms.push(program);
    });
  });

  const remainingPrograms = state.programs
    .filter((program) => program.shown !== shownValue)
    .map((program) => normalizeProgram(program));

  state.programs = shownValue === 1
    ? [...nextPrograms, ...remainingPrograms]
    : [...remainingPrograms, ...nextPrograms];

  const current = JSON.stringify(
    nextPrograms.map((program) => ({
      id: program.id,
      tierId: program.tierId
    }))
  );

  return previous !== current;
}

function openCreateModal(tierId) {
  if (!state.isUnlocked) {
    return;
  }

  state.modalMode = "create";
  state.modalContext = "active";
  state.activeProgramId = null;
  state.activeTierId = tierId;

  elements.modalTitle.textContent = "新建项目";
  elements.submitButton.textContent = "新建";
  elements.deleteButton.classList.add("hidden");
  elements.purgeButton.classList.add("hidden");

  elements.form.reset();
  elements.schoolSearchInput.value = "";
  syncSchoolOptions("", SCHOOL_OPTIONS[0].id);
  elements.durationSelect.value = "";
  populateStatusSelect([], "draft:stay");
  updateModalSchoolPreview();
  showModal();
}

function openEditModal(programId, modalContext = "active") {
  if (!state.isUnlocked) {
    return;
  }

  const program = state.programs.find((item) => item.id === programId);
  if (!program) {
    return;
  }

  state.modalMode = "edit";
  state.modalContext = modalContext;
  state.activeProgramId = programId;
  state.activeTierId = program.tierId;

  elements.modalTitle.textContent = modalContext === "trash" ? "编辑回收站项目" : "编辑项目";
  elements.submitButton.textContent = "保存";
  elements.deleteButton.classList.remove("hidden");
  elements.deleteButton.textContent = modalContext === "trash" ? "还原" : "删除";
  elements.purgeButton.classList.toggle("hidden", modalContext !== "trash");

  elements.shortNameInput.value = program.shortName;
  elements.schoolSearchInput.value = "";
  syncSchoolOptions("", program.schoolId);
  elements.cnNameInput.value = program.cnName;
  elements.enNameInput.value = program.enName;
  elements.durationSelect.value = program.duration || "";
  elements.websiteInput.value = program.websiteUrl || "";
  elements.ddlInput.value = program.ddlTime || "";
  elements.greInput.value = program.greRequirement || "";
  elements.langInput.value = program.languageRequirement || "";
  elements.recInput.value = program.recommendationRequirement || "";
  elements.otherInput.value = program.otherRequirements || "";

  populateStatusSelect(program.statusHistory, `${getCurrentStatus(program)}:stay`);
  updateModalSchoolPreview();
  showModal();
}

function populateStatusSelect(statusHistory, selectedValue) {
  const options = getStatusSelectChoices(statusHistory);
  const fragment = document.createDocumentFragment();

  options.forEach((choice) => {
    const option = document.createElement("option");
    option.value = choice.value;
    option.textContent = choice.label;
    fragment.appendChild(option);
  });

  elements.statusSelect.innerHTML = "";
  elements.statusSelect.appendChild(fragment);
  elements.statusSelect.value = options.some((choice) => choice.value === selectedValue)
    ? selectedValue
    : options[0].value;
}

function showModal() {
  elements.modal.classList.remove("hidden");
  elements.modal.setAttribute("aria-hidden", "false");
  setTimeout(() => elements.shortNameInput.focus(), 0);
}

function closeModal() {
  elements.modal.classList.add("hidden");
  elements.modal.setAttribute("aria-hidden", "true");
}

function openReadModal(programId) {
  const program = state.programs.find((item) => item.id === programId);
  if (!program) {
    return;
  }

  if (program.websiteUrl) {
    elements.readWebsite.href = program.websiteUrl;
    elements.readWebsite.textContent = program.websiteUrl;
  } else {
    elements.readWebsite.removeAttribute("href");
    elements.readWebsite.textContent = "-";
  }

  elements.readDdl.textContent = program.ddlTime || "-";
  elements.readGre.textContent = program.greRequirement || "无";
  elements.readLang.textContent = program.languageRequirement || "免";
  elements.readRec.textContent = program.recommendationRequirement || "-";
  elements.readOther.textContent = program.otherRequirements || "-";

  elements.readModal.classList.remove("hidden");
  elements.readModal.setAttribute("aria-hidden", "false");
}

function closeReadModal() {
  elements.readModal.classList.add("hidden");
  elements.readModal.setAttribute("aria-hidden", "true");
}

function openTrashModal() {
  if (!state.isUnlocked) {
    return;
  }

  renderTrashBoard();
  elements.trashModal.classList.remove("hidden");
  elements.trashModal.setAttribute("aria-hidden", "false");
}

function closeTrashModal() {
  elements.trashModal.classList.add("hidden");
  elements.trashModal.setAttribute("aria-hidden", "true");
}

function openUnlockModal() {
  setUnlockError("");
  elements.unlockForm.reset();
  elements.unlockModal.classList.remove("hidden");
  elements.unlockModal.setAttribute("aria-hidden", "false");
  setTimeout(() => elements.unlockPasswordInput.focus(), 0);
}

function closeUnlockModal() {
  elements.unlockModal.classList.add("hidden");
  elements.unlockModal.setAttribute("aria-hidden", "true");
  setUnlockError("");
}

function setUnlockError(message) {
  elements.unlockError.textContent = message;
  elements.unlockError.classList.toggle("hidden", !message);
}

function updateUnlockButtonState() {
  elements.unlockButton.classList.toggle("is-unlocked", state.isUnlocked);
  elements.unlockButton.title = state.isUnlocked ? "编辑功能已解锁" : "解锁编辑功能";
  elements.unlockButton.setAttribute("aria-label", state.isUnlocked ? "编辑功能已解锁" : "解锁编辑功能");
  elements.trashButton.classList.toggle("hidden", !state.isUnlocked);
  elements.trashButton.classList.toggle("is-visible", state.isUnlocked);
}

function updateModalSchoolPreview() {
  const school = getSchoolById(elements.schoolSelect.value);
  loadSchoolLogo(elements.modalLogo, elements.modalLogoPlaceholder, school);
}

function normalizePrograms(programs) {
  if (!Array.isArray(programs) || programs.length === 0) {
    return structuredClone(DEFAULT_PROGRAMS).map(normalizeProgram);
  }

  return programs.map(normalizeProgram);
}

function normalizeProgram(program) {
  const history = Array.isArray(program?.statusHistory)
    ? program.statusHistory
        .filter((entry) => entry && STATUS_DEFINITIONS[entry.status])
        .map((entry) => ({
          status: entry.status,
          changedAt: typeof entry.changedAt === "string" ? entry.changedAt : new Date().toISOString()
        }))
    : [];

  return {
    id: typeof program?.id === "string" ? program.id : createId(),
    tierId: program?.tierId || "match",
    shortName: program?.shortName || "",
    schoolId: schoolMap.has(program?.schoolId) ? program.schoolId : SCHOOL_OPTIONS[0].id,
    cnName: program?.cnName || "",
    enName: program?.enName || "",
    duration: program?.duration || "",
    websiteUrl: program?.websiteUrl || "",
    ddlTime: program?.ddlTime || "",
    greRequirement: program?.greRequirement || "",
    languageRequirement: program?.languageRequirement || "",
    recommendationRequirement: program?.recommendationRequirement || "",
    otherRequirements: program?.otherRequirements || "",
    shown: Number(program?.shown) === 0 ? 0 : 1,
    statusHistory: history
  };
}

function getCurrentStatus(program) {
  const history = Array.isArray(program?.statusHistory) ? program.statusHistory : [];
  return history.length ? history[history.length - 1].status : "draft";
}

function getCurrentStatusLabel(program) {
  const history = Array.isArray(program?.statusHistory) ? program.statusHistory : [];
  if (history.length === 0) {
    return STATUS_DEFINITIONS.draft.label;
  }

  return getHistoryEntryLabel(history[history.length - 1], history, history.length - 1);
}

function getStatusSelectChoices(statusHistory) {
  const history = Array.isArray(statusHistory) ? statusHistory : [];
  const currentStatus = history.length ? history[history.length - 1].status : "draft";
  const currentInterviewRound = getInterviewRoundFromHistory(history);

  if (currentStatus === "draft") {
    return [
      { value: "draft:stay", label: STATUS_DEFINITIONS.draft.label },
      { value: "applied:append", label: STATUS_DEFINITIONS.applied.label }
    ];
  }

  if (currentStatus === "applied") {
    return [
      { value: "applied:stay", label: STATUS_DEFINITIONS.applied.label },
      { value: "interview:append", label: "Interview Round 1 👨🏻‍💼" },
      { value: "admitted:append", label: STATUS_DEFINITIONS.admitted.label },
      { value: "waitlist:append", label: STATUS_DEFINITIONS.waitlist.label },
      { value: "reject:append", label: STATUS_DEFINITIONS.reject.label }
    ];
  }

  if (currentStatus === "interview") {
    return [
      { value: "interview:stay", label: `Interview Round ${currentInterviewRound} 👨🏻‍💼` },
      { value: "interview:append", label: `Interview Round ${currentInterviewRound + 1} 👨🏻‍💼` },
      { value: "admitted:append", label: STATUS_DEFINITIONS.admitted.label },
      { value: "waitlist:append", label: STATUS_DEFINITIONS.waitlist.label },
      { value: "reject:append", label: STATUS_DEFINITIONS.reject.label }
    ];
  }

  if (currentStatus === "waitlist") {
    return [
      { value: "waitlist:stay", label: STATUS_DEFINITIONS.waitlist.label },
      { value: "admitted:append", label: STATUS_DEFINITIONS.admitted.label },
      { value: "reject:append", label: STATUS_DEFINITIONS.reject.label }
    ];
  }

  if (currentStatus === "admitted") {
    return [{ value: "admitted:stay", label: STATUS_DEFINITIONS.admitted.label }];
  }

  if (currentStatus === "reject") {
    return [{ value: "reject:stay", label: STATUS_DEFINITIONS.reject.label }];
  }

  return [{ value: "draft:stay", label: STATUS_DEFINITIONS.draft.label }];
}

function buildNextStatusHistory(currentHistory, selectedStatus) {
  const history = Array.isArray(currentHistory) ? currentHistory.map((entry) => ({ ...entry })) : [];
  const [targetStatus, action] = String(selectedStatus || "").split(":");

  if (action !== "append" || !STATUS_DEFINITIONS[targetStatus]) {
    return history;
  }

  const allowedChoices = getStatusSelectChoices(history)
    .filter((choice) => choice.value.endsWith(":append"))
    .map((choice) => choice.value);

  if (!allowedChoices.includes(`${targetStatus}:append`)) {
    return history;
  }

  history.push({
    status: targetStatus,
    changedAt: new Date().toISOString()
  });

  return history;
}

function getProgressSegments(program) {
  const history = Array.isArray(program.statusHistory) ? program.statusHistory : [];

  if (history.length === 0) {
    return [{ colorClass: STATUS_DEFINITIONS.draft.colorClass, title: "" }];
  }

  const segments = history.map((entry, index) => {
    const definition = STATUS_DEFINITIONS[entry.status];
    return {
      colorClass: definition.colorClass,
      title: `${getHistoryEntryLabel(entry, history, index)}\n${formatStatusTime(entry.changedAt)}`
    };
  });

  if (!TERMINAL_STATUSES.has(getCurrentStatus(program))) {
    segments.push({ colorClass: STATUS_DEFINITIONS.draft.colorClass, title: "" });
  }

  return segments;
}

function formatStatusTime(changedAt) {
  try {
    return `Updated: ${new Date(changedAt).toLocaleString("en-US", { hour12: false })}`;
  } catch (error) {
    return "Updated: Unknown";
  }
}

function getInterviewRoundFromHistory(history, targetIndex = history.length - 1) {
  let round = 0;
  for (let index = 0; index <= targetIndex; index += 1) {
    if (history[index]?.status === "interview") {
      round += 1;
    }
  }
  return round;
}

function getHistoryEntryLabel(entry, history, index) {
  if (entry.status === "interview") {
    return `Interview Round ${getInterviewRoundFromHistory(history, index)} 👨🏻‍💼`;
  }

  return STATUS_DEFINITIONS[entry.status]?.label || "";
}

function getSchoolById(schoolId) {
  return schoolMap.get(schoolId) || SCHOOL_OPTIONS[0];
}

function loadSchoolLogo(imgElement, placeholderElement, school) {
  if (!school || !school.domain) {
    placeholderElement.hidden = false;
    imgElement.hidden = true;
    return;
  }

  placeholderElement.hidden = false;
  imgElement.hidden = true;
  imgElement.alt = `${school.cn} Logo`;
  imgElement.src = getLogoUrl(school);

  imgElement.onload = () => {
    placeholderElement.hidden = true;
    imgElement.hidden = false;
  };

  imgElement.onerror = () => {
    placeholderElement.hidden = false;
    imgElement.hidden = true;
  };
}

function getLogoUrl(school) {
  // 优先使用本地内联缓存（首次加载零网络请求）
  if (school.id && LOGO_MAP[school.id]) {
    return LOGO_MAP[school.id];
  }
  // 回退：Google favicon API（仅当缓存未命中）
  return `https://www.google.com/s2/favicons?sz=128&domain_url=https://${school.domain}`;
}

function getProgramsByTier(tierId, shownValue = 1) {
  return state.programs.filter((program) => program.tierId === tierId && program.shown === shownValue);
}

function scheduleSave(reason, delay) {
  window.clearTimeout(state.saveTimer);
    reason,
    delay,
    programCount: state.programs.length
  });

  hideSaveStatus();
  if (delay <= 0) {
    persistState(reason);
    return;
  }

  state.saveTimer = window.setTimeout(() => {
    persistState(reason);
  }, delay);
}

async function persistState(reason) {
  state.programs = normalizePrograms(state.programs);
  saveLocalCache(state.programs);

  if (!isGithubConfigured()) {
      reason
    });
    setSaveStatus("GitHub 保存未启用，当前仅写入本地缓存", "error");
    return;
  }

  if (state.syncing) {
      reason
    });
    return;
  }

  state.syncing = true;
    reason,
    programCount: state.programs.length
  });

  hideSaveStatus();
  const ok = await saveToGithubIssues(state.programs);
  state.syncing = false;

    reason,
    ok
  });

  if (ok) {
    setSaveStatus("已保存到 GitHub Issues", "success");
  } else {
    setSaveStatus("GitHub 保存失败，变更已保留在本地缓存", "error");
  }
}

function loadLocalCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return structuredClone(DEFAULT_PROGRAMS);
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : structuredClone(DEFAULT_PROGRAMS);
  } catch (error) {
    console.error("读取本地缓存失败:", error);
    return structuredClone(DEFAULT_PROGRAMS);
  }
}

function saveLocalCache(programs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizePrograms(programs)));
  } catch (error) {
    console.error("写入本地缓存失败:", error);
  }
}

async function loadFromGithubIssues() {
  try {
    const response = await fetch(`${WORKER_URL}/api/data`);
    if (!response.ok) {
        status: response.status
      });
      return null;
    }
    const result = await response.json();
    if (!result.data) {
      return null;
    }
    return Array.isArray(result.data) && result.data.length ? normalizePrograms(result.data) : null;
  } catch (error) {
      error: String(error)
    });
    console.error("读取数据失败:", error);
    return null;
  }
}

async function saveToGithubIssues(programs) {
  try {
    const response = await fetch(`${WORKER_URL}/api/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.authToken}`
      },
      body: JSON.stringify({ programs })
    });
    
      status: response.status,
      ok: response.ok
    });
    
    return response.ok;
  } catch (error) {
      error: String(error)
    });
    console.error("保存数据失败:", error);
    return false;
  }
}

function isGithubConfigured() {
  return Boolean(WORKER_URL && WORKER_URL.startsWith("http"));
}

function clearTierDropState() {
  document.querySelectorAll(".tier-column.drag-target").forEach((node) => {
    node.classList.remove("drag-target");
  });
}

function setSaveStatus(message, type = "info") {
  window.clearTimeout(state.saveStatusTimer);

  if (type === "info") {
    hideSaveStatus();
    return;
  }

  elements.saveStatus.textContent = message;
  elements.saveStatus.classList.remove("hidden", "is-success", "is-error");
  elements.saveStatus.classList.add(type === "success" ? "is-success" : "is-error");

  if (type === "success") {
    state.saveStatusTimer = window.setTimeout(() => {
      hideSaveStatus();
    }, 1800);
  }
}

function hideSaveStatus() {
  window.clearTimeout(state.saveStatusTimer);
  elements.saveStatus.textContent = "";
  elements.saveStatus.classList.add("hidden");
  elements.saveStatus.classList.remove("is-success", "is-error");
}

async function sha256Hex(value) {
  if (!window.crypto?.subtle) {
    throw new Error("crypto.subtle is unavailable");
  }

  const encoded = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function createId() {
  return `program-${Math.random().toString(36).slice(2, 10)}`;
}
