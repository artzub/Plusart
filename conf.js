var bpls = 2,
    APIs = [
        {a : 'AIzaSyAsyXRlUEgHZC4RNwQ7YrsVonWVEhB-FpY', c : '733153716518.apps.googleusercontent.com', b : 0},
        {a : 'AIzaSyBZFxTKwehxucjS0kisCvwfdckbsmhvuHA', c : '10444840265-b03d2t188g55g1bss2lej59dudvhqu8c.apps.googleusercontent.com', b : 0},
        {a : 'AIzaSyDN7_J-f2xrWVnx_A6JEVJd-9XL4KheyeM', c : '311247445793.apps.googleusercontent.com', b : 0}
    ],
conf = {
    API_KEY: APIs[bpls].a,
    CLIENT_ID: APIs[bpls].c,
    REDIRECT_URI: 'http://plusart.artzub.com/',
    AUTH_SCOPE: 'https://www.googleapis.com/auth/plus.me',
    AUTH_URI: 'https://accounts.google.com/o/oauth2/auth',
    TOKEN_INFO_URI: 'https://www.googleapis.com/oauth2/v1/tokeninfo',
    BASE_REQUEST_URI: 'https://www.googleapis.com/plus/v1/'
};

plusart.Count = 10;
plusart.Depth = 1;
plusart.useKey = false;
plusart.useRandom = true;
plusart.maxResults = { replies : 10, plusoners : 10, resharers : 10 };