var bpls = true,
    conf = {
  API_KEY: bpls ? 'AIzaSyAsyXRlUEgHZC4RNwQ7YrsVonWVEhB-FpY' : 'AIzaSyBZFxTKwehxucjS0kisCvwfdckbsmhvuHA',
  CLIENT_ID: bpls ? '733153716518.apps.googleusercontent.com' : '10444840265-b03d2t188g55g1bss2lej59dudvhqu8c.apps.googleusercontent.com',
  REDIRECT_URI: 'http://plusar.artzub.com/',
  AUTH_SCOPE: 'https://www.googleapis.com/auth/plus.me',
  AUTH_URI: 'https://accounts.google.com/o/oauth2/auth',
  TOKEN_INFO_URI: 'https://www.googleapis.com/oauth2/v1/tokeninfo',
  BASE_REQUEST_URI: 'https://www.googleapis.com/plus/v1/'
};

plusar.Count = 10;
plusar.Depth = 1;
plusar.useKey = false;
plusar.useDepth = true;
plusar.maxResults = { replies : 10, plusoners : 10, resharers : 10 };
