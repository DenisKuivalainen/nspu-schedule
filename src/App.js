import logo from './logo.svg';
import './App.css';
import { useEffect, useMemo, useState } from 'react';
import ex from './ex.json';
import { useCookies } from 'react-cookie';
import { AppBar, Button, ButtonGroup, createMuiTheme, CssBaseline, FormControlLabel, Grid, IconButton, LinearProgress, MenuItem, Paper, Select, Switch, Tab, Tabs, TextField, ThemeProvider, Toolbar, Typography, useTheme } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';
import * as colors from '@material-ui/core/colors';
import { ArrowBackIosRounded, CloseRounded, Looks3Rounded, Looks4Rounded, Looks5Rounded, Looks6Rounded, LooksOneRounded, LooksTwoRounded, NightsStayRounded, ReplayRounded, SettingsRounded as SettingsIcon, WbSunnyRounded } from '@material-ui/icons';
import PWAPrompt from 'react-ios-pwa-prompt';

export const cookiesParams = {
  path: '/',
  httpOnly: false,
  maxAge: 5 * 365 * 24 * 60 * 60 * 1000,
}

const AppContent = () => {
  const [loaded, setLoaded] = useState(false);
  const [url, setUrl] = useState(false);
  const [data, setData] = useState(null);
  const [cookies, setCookie] = useCookies();

  const checkAndFetch = async () => {
    await setLoaded(false);
    await setUrl(false);
    await setData(null);

    if(!cookies.url) {
      await setLoaded(true);
      return;
    }
    else await setUrl(true);
    if(process.env.NODE_ENV !== "production") {
      await setData(ex);
      await setLoaded(true);
      return;
    }
    try {
      const res = await fetch('/api/schedule');
      if(res.status === 200) {
        const resData = await res.json();
        await setData(resData);
      };
      setLoaded(true);
    } catch (e) {
      console.error(e);
      setLoaded(true);
    }
  }

  useEffect(checkAndFetch, []);
  useEffect(checkAndFetch, [cookies.url]);

  const [width, setWidth] = useState(0);
  useEffect(() => setWidth(window.innerWidth));

  if(width > 540) return (
    <div style={{marginLeft: 30, marginRight: 30, paddingTop: 50}}>
      <Typography color="textPrimary">
        ????????????????, ?????????????????????? ?????????????? ????????????, ???? ???????????? ???????????? ???????????????????? ?????????????????? ???????????? ???? ?????????????????? ??????????????????????.
      </Typography>
      <Typography style={{margin: 10}} color="textSecondary">
        ???????? ???? ?????????????? ???????????? ???????????????? ????????????????????????????, ???????????????? ???????????? ?? ?????????????????? ?????????????????? ???????????????? ???? ?????????? <a href="mailto:support@nspu-schedule.ru" style={{color: "inherit"}}>support@nspu-schedule.ru</a>.
      </Typography>
    </div>
  );
  if(!loaded) return <NotLoaded />;
  if(!url) return <NoUrl />;
  if(!data) return <NotFetched reload={checkAndFetch} />;
  return <Timetable data={data} />
}

export default () => {
  const [cookies, setCookie] = useCookies(['theme']);
  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: !!cookies.theme ? 'dark' : 'light',
          primary: colors[cookies.primary] || colors.blue,
          secondary: colors[cookies.secondary] || colors.pink,
          background: {
            paper: !!cookies.theme ? '#1f1f1f' : '#f0f0f0',
            default: !!cookies.theme ? '#0f0f0f' : '#fff',
          },
        },
      }),
    [cookies]
  );  

  return(
    <ThemeProvider theme={theme}>
      <PWAPrompt
        copyTitle="???????????????? ???? ?????????????? ????????"
        copyBody="???????????? ???????????????? ?????????? ?????????????????????????????? ?????? ????????????????????. ???????????????? ???? ???? ?????????????? ???????? ?? ?????????????????????? ?? ?????????????????????????? ????????????."
        copyShareButtonLabel="1) ?????????????? ???????????? ???????????????????????? ?? ???????????? ???????? ????????."
        copyAddHomeButtonLabel="2) ?????????????? ?????????????????? ???? ?????????????? ????????????."
        copyClosePrompt="??????????????"
      />
      <CssBaseline />
      <Paper
        elevation={0}
        style={{maxWidth: 540, height: "100vh", margin: "auto", boxRadius: 0}}
      >
        <AppContent />
      </Paper>
    </ThemeProvider>

  )
}

const NoUrl = ({}) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(" ");
  const [cookies, setCookie] = useCookies();

  const recordInput = (e) => {
    setValue(e.target.value);
    setError(false);
    setErrorMessage(" ");
  }

  const checkAndSet = () => {
    const isUrl = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);
    const hasHttps = new RegExp(/https:\/\//);
    const hasId = new RegExp(/.php\?id=/);
    const isNspu = new RegExp(/schedule.nspu.ru/);
    const isNumbers = new RegExp(/^[-+]?[0-9]+$/);

    if (!isUrl.test(value)) {
      setError(true);
      setErrorMessage("?????????????? ???????????? ???? ????????????????????");
      return;
    }
    if (!isNspu.test(value)) {
      setError(true);
      setErrorMessage("???????????? ???????????? ?????????? ???? ?????????? schedule.nspu.ru");
      return;
    }
    if (!hasHttps.test(value)) {
      setError(true);
      setErrorMessage("???????????? ???????????? ???????????????????? ?? https://");
      return;
    }
    if (!hasId.test(value) || !isNumbers.test(value.slice(value.lastIndexOf("=") + 1))) {
      setError(true);
      setErrorMessage("???????????? ???????????? ?????????????????????????? ???? id ???????????? ????????????????????");
      return;
    }
    setCookie('url', value, cookiesParams);
  }

  return(
    <div
      style={{padding: "72px 20px 0px 20px"}}
    >
      <Typography variant="h6" style={{marginBottom: 36, padding: "0 10px"}}>
        ?????????????? ???????????? ???? ????????????????????
      </Typography>
      <div style={{marginBottom: 10, width: "100%"}}>
        <TextField
          id="outlined-basic"
          label="????????????"
          variant="outlined"
          error={error}
          helperText={errorMessage}
          value={value}
          onChange={recordInput}
          style={{width: "100%"}}
        />
      </div>
      <div style={{float: "right", marginRight: 20}}>
        <Button
          variant="contained"
          color="secondary"
          onClick={checkAndSet}
        >
          ????????????
        </Button>
      </div>
    </div>
  )
}

const NotFetched = ({reload}) => {
  const [cookies, setCookie, removeCookie] = useCookies();
  return (
    <div
      style={{padding: "120px 20px 0px 20px"}}
    >
      <Typography variant="h6" style={{marginBottom: 36, padding: "0 10px"}}>
        ???? ?????????????? ?????????????????? ????????????????????
      </Typography>
      <div style={{float: "right", marginRight: 20}}>
        <Button
          variant="contained"
          color="primary"
          onClick={reload}
          startIcon={<ReplayRounded />}
        >
          ?????????????????????? ??????????
        </Button>
        <Typography variant="h6" style={{marginBottom: 10, marginTop: 10, padding: "0 10px", textAlign: "center"}}>
          ??????
        </Typography>
        <Button
          variant="contained"
          color="primary"
          style={{width: "100%"}}
          onClick={() => removeCookie('url')}
        >
          ???????????? ???????????? ??????????
        </Button>
      </div>
    </div>
  )
}

const NotLoaded = () => (
  <div>
    <LinearProgress />
    {/* <img src="/cat2.gif" alt="cat :3" style={{marginTop: "20vh"}} /> */}
  </div>
)

const TabPannel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
    style={{left: 0, width: "100vw", overflow: "hidden"}}
      role="tabpanel"
      className="ttl-page"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Typography>{children}</Typography>
      )}
    </div>
  );
}

const Timetable = ({data}) => {
  const a11yProps = (index) => {
    return {
      id: `full-width-tab-${index}`,
      'aria-controls': `full-width-tabpanel-${index}`,
    };
  };

  const theme = useTheme();
  const [cookies, setCookie, removeCookie] = useCookies(['current']);
  const [value, setValue] = useState(0);
  const [day, setDay] = useState(0);
  const [ttl, setTtl] = useState();
  const [title, setTitle] = useState("");

  const [settings, setSettings] = useState(false);

  const weekTtl = (obj, n) => {
    return Object.entries(obj).map(val => {
      return [
        val[0],
        val[1].length > 1 ? val[1][n] : val[1][0]
      ]
    })
  }
  const currentDay = () => {
    setChecked(!!cookies.current)
    let today = (new Date).getDay() - 1;
    if(today < 0) today = 0;
    setTtl(weekTtl(data.days[days[today][1]], data.week.type));
    setTitle(getTitle(today, data.week.type));
  }
  useEffect(currentDay, []);

  const setWeek = (n) => {
    setTtl(weekTtl(data.days[days[day - 1][1]], n))
    setTitle(getTitle(day - 1, n));
    setValue(0);
    setDay(0);
  }

  const handleChange = (event, newValue) => {
    setDay(0);
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setDay(0);
    setValue(index);
  };

  const getTitle = (d, w) => {
    return `${days[d][0]}, ${w === 0 ? "??????????????????" : "??????????????????????"}`
  }

  const [checked, setChecked] = useState(false);
  useEffect(() => {
    checked ? setCookie('current', 'TATAKAE!', cookiesParams) : removeCookie('current')
  }, [checked])

  if (settings) return <Settings close={() => setSettings(false)} />;
  return (
    <>
      <AppBar
        position="static"
        style={{height: 48, maxWidth: 540, position: "fixed", top: 0}}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          variant="fullWidth"
        >
          <Tab label="????????????????????" {...a11yProps(0)}/>
          <Tab label="?????????? ??????" {...a11yProps(1)}/>
        </Tabs>
      </AppBar>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        <TabPannel value={value} index={0} dir={theme.direction} style={{minHeight: "100vh"}}>
          <div style={{height: 48}} />
          <Typography
            style={{ marginTop: 10, marginBottom: 10, fontWeight: "bold" }}
            align="center"
            variant="h6"
            color="primary"
          >
            {title}
          </Typography>
          <Typography color="textSecondary"><hr style={{ color: "inherit" }} /></Typography>
          {ttl && ttl.map(val => {
            let now = Date.now();
            const clss = val[1].map(c => {
              const { titl, desc, till, from } = c;
              if(titl.length === 0 || !!cookies.current && (till < now || from - 604800000 > now)) return undefined;

              return (
                <div style={{marginLeft: 14}}>
                  <Typography
                    id="descTxt"
                    color="textPrimary"
                    dangerouslySetInnerHTML={{ __html: titl }}
                  />
                  {!!desc && (
                    <Typography
                      id="descTxt"
                      variant="body2"
                      color="textSecondary"
                      style={{marginLeft: 14}}
                      dangerouslySetInnerHTML={{ __html: desc }} 
                    />
                  )}
                </div>
              )
            }).filter(c => !!c);

            if (clss.length === 0) return;

            return (
              <div style={{marginRight: 10, marginLeft: 10}}>
                <div style={{marginTop: 14, marginBottom: 14, marginRight: 4, marginLeft: 4}}>
                  <Typography
                    color="primary"
                    style={{fontWeight: "bold", marginBottom: 14}}
                  >
                    {val[0]}
                  </Typography>
                  {clss.map((e, i) => i < clss.length - 1 ? [e, <div style={{height: 14}} />] : [e]).reduce((a, b) => a.concat(b))}
                </div>
                <Typography color="textSecondary"><hr style={{ color: "inherit" }} /></Typography>
              </div>
            );
          })}
          <Typography
            variant="body2"
            color="textSecondary"
            id="descTxt"
            style={{marginLeft: 14, marginBottom: 8}}
          >
            <a href={cookies.url}>?????????????? ????????????????</a>
          </Typography>
          <div style={{height: 36}} />
          <div style={{height: 36, width: "100vw", backgroundColor: "white", position: "fixed", bottom: 0}} />
        </TabPannel>
        <TabPannel value={value} index={1} dir={theme.direction}>
          <div style={{height: 48}} />
          <Days
            day={day} setDay={setDay}
            week={data.week.type} setWeek={setWeek}
          />
          <div style={{height: 36}} />
        </TabPannel>
      </SwipeableViews>
      <Footer>
        {value === 0 && (
          <FormControlLabel
            style={{marginRight: 10}}
            value="start"
            control={
              <Switch
                color="secondary"
                checked={checked}
                onClick={() => setChecked(!checked)}
              />
            }
            label="???????????????? ???? ?????????????? (beta)"
            labelPlacement="start"
          />
        )}
        {value === 1 && (
          <p style={{marginTop: 0}} >           
            <IconButton
              color="secondary"
              style={{
                height: 36,
                marginBottom: 3,
                marginLeft: "calc(100vw - 46px)",
              }}
              onClick={() => setSettings(true)}
            >
              <SettingsIcon />
            </IconButton>
          </p>
          )}
      </Footer>
    </>
  );
}

const Footer = ({children}) => {
  return(
    <footer
      class="MuiPaper-root MuiAppBar-root MuiAppBar-positionFixed MuiAppBar-colorPrimary mui-fixed MuiPaper-elevation4"
      style={{height: 36, position: "fixed", top: "calc(100vh - 36px)"}}
    >
      {children}
    </footer>
  )
}

const days = [
  ["??????????????????????", "mo"],
  ["??????????????", "ti"],
  ["??????????", "ke"],
  ["??????????????", "to"],
  ["??????????????", "pe"],
  ["??????????????", "la"]
];

const Days = ({day, setDay, week, setWeek}) => {

  return (
    <Grid container spacing={3} style={{marginTop: "15vw"}}>
      {days.map((val, k) => {
        const thisSelected = day === k + 1;
        const today = (new Date).getDay() === k + 1; // 0 is sunday

        return (
          <Grid 
            item xs={12}
            style={{marginLeft: "15%", marginRight: "15%"}}
          >
            {!thisSelected && (
              <Button
                onClick={() => setDay(k + 1)}
                variant={"contained"}
                color={today ? "secondary" : "default"}
                style={{width: "100%"}}
              >
                {val[0]}
              </Button>
            )}
            {thisSelected && (
              <ButtonGroup
                variant={"contained"}
                style={{width: "100%"}}
              >
                <Button
                  style={{width: "50%"}}
                  color={week === 0 && today ? "secondary" : "default"}
                  onClick={() => setWeek(0)}
                >
                  ??????????????????
                </Button>
                <Button
                  style={{width: "50%"}}
                  color={week === 1 && today ? "secondary" : "default"}
                  onClick={() => setWeek(1)}
                >
                  ??????????????????????
                </Button>
              </ButtonGroup>
            )}
          </ Grid>
        )
      })}
      <Grid 
        item xs={12}
        style={{marginLeft: "15%", marginRight: "15%"}}
      >
        <Typography color="textSecondary" variant="subtitle2" align="center">
        {(new Date()).getFullYear()} ?? kuivalainen.
        </Typography>
      </Grid>
    </Grid>
  );
}

const Settings = (props) => {
  const [option, setOption] = useState(0);
  const [cookies, setCookie] = useCookies(['theme']);

  return <div
    style={{
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
      position: "relative",
      backgroundColor: !!cookies.theme ? '#1f1f1f' : '#f0f0f0',
      zIndex: 100,
      paddingTop: 54
    }}
  >
    <AppBar style={{height: 48, width: "100vw", left: 0}}>
      <Toolbar position="static" style={{height: 48, minHeight: 48, maxHeight: 48, width: "100vw", left: 0}}>
        <IconButton onClick={() => {
          if(option === 0) props.close();
          else setOption(0);
        }}>
          {
            option === 0 ? 
            <CloseRounded color="secondary" /> :
            <ArrowBackIosRounded color="secondary" />
          }
        </IconButton>
        <Typography>{getSettingsTitle(option)}</Typography>
      </Toolbar>
    </AppBar>
    <div>
      <SettingsMenu option={option} setOption={setOption} />
    </div>
  </div>
}

const getSettingsTitle = (n) => {
  switch (n) {
    case 1:
      return '????????????????????';
    case 2:
      return '????????????????????';
    case 3:
      return '??????????????????';
    case 4:
      return '';
    default:
      return '??????????????????';
  }
}

const SettingsMenu = ({option, setOption}) => {
  switch (option) {
    case 1:
      return <NewTtl />;
    case 2:
      return <ChangeTheme />;
    case 3:
      return <AskMeHelp />;
    case 4:
      return <Code />;
    default:
      return <SettingsButtons setOption={setOption} />;
  }
}

const SettingsButton = ({text, ...props}) => (
  <Grid 
    item xs={12}
    style={{marginLeft: "15%", marginRight: "15%"}}
  >
    <Button
      style={{width: "100%"}}
      color="primary"
      variant={"contained"}
      {...props}
    >
      {text}
    </Button>
  </Grid>
)

const SettingsButtons = ({setOption}) => {
  return(
    <Grid container spacing={3} style={{marginTop: "15vw"}}>
      <SettingsButton onClick={() => setOption(1)} text="????????????????????" />
      <SettingsButton onClick={() => setOption(2)} text="????????????????????" />
      <SettingsButton onClick={() => setOption(3)} text="??????????????????" />
      <SettingsButton onClick={() => setOption(4)} variant={"outlined"} text="....." />
      {/* <Grid 
        item xs={12}
        style={{marginLeft: "15%", marginRight: "15%"}}
      >
        <Typography color="textSecondary" variant="subtitle2" align="center">
          {(new Date()).getFullYear()} ?? <a href="https://github.com/DenisKuivalainen" style={{color: "inherit", textDecoration: "none"}}>Kuivalainen</a>.
        </Typography>
      </Grid> */}
    </Grid>
  )
}

const Code = () => {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState();
  const [loading, setLoading] = useState(false);
  const handleClick = async (s) => {
    const newCode = `${code}${s}`;
    await setCode(newCode);
    if (newCode.length === 4) {
      await getMsg(newCode);
      return;
    }
  }

  const getMsg = async (nc) => {
    setLoading(true);
    try{
      const data = await fetch(`/api/code?code=${nc}`).then(res => res.json());
      if(!data.status) {
        abort();
        return;
      }
      delete data.status;
      if(data.text || data.img) {
        setMsg(data);
        return;
      }
      abort();
    } catch (e) {
      abort();
      console.error(e);
    }
  }
  const abort = () => {
    setCode("");
    setLoading(false);
  }

  const R = ({children}) => (
    <div
      style={{
        width: "60vw",
        height: "20vw",
        display: "table"
      }}
    >
      {children}
    </div>
  )
  const C = ({s}) => (
    <div
      style={{
        width: "33%",
        height: "100%",
        padding: 5,
        display: "table-cell"
      }}
    >
      <Button
        style={{
          height: "100%",
          width: "100%"
        }}
        onClick={() => handleClick(s)}
        variant="contained"
        color="secondary"
        disabled={loading}
      >{s}</Button>
    </div>
  )

  const progress = loading ? {} : {variant: "determinate", value: code.length * 25}

  if (!msg) return (
    <div
      style={{
        padding: "20vw"
      }}
    >
      <LinearProgress
        color="secondary"
        variant={!loading ? "determinate" : undefined}
        value={!loading ? (code.length * 25) : undefined}
        style={{
          width: "100%",
          marginBottom: "5vw"
        }}
      />
      <R>
        <C s="1" />
        <C s="2" />
        <C s="3" />
      </R>
      <R>
        <C s="4" />
        <C s="5" />
        <C s="6" />
      </R>
      <R>
        <C s="7" />
        <C s="8" />
        <C s="9" />
      </R>
      <R>
        <div style={{width: "33%"}} />
        <C s="0" />
        <div style={{width: "33%"}} />
      </R>
    </div>
  )
  if(msg.img) return (
    <div
      style={{
        padding: "20vw"
      }}
    >
      <img style={{width: "100%"}} src={msg.img} alt="w3yfhwy3r8q3rncwr39" />
    </div>
  )
  if(msg.text) return (
    <div
      style={{
        padding: "3vw",
        paddingTop: "15vw"
      }}
    >
      {
        msg.text.map(s => <Typography>{s}</Typography>)
      }
    </div>
  )
}

const NewTtl = () => {
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(" ");
  const [cookies, setCookie] = useCookies();
  const [value, setValue] = useState(decodeURIComponent(cookies.url));

  const recordInput = (e) => {
    setValue(e.target.value);
    setError(false);
    setErrorMessage(" ");
  }

  const checkAndSet = () => {
    const isUrl = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);
    const hasHttps = new RegExp(/https:\/\//);
    const hasId = new RegExp(/.php\?id=/);
    const isNspu = new RegExp(/schedule.nspu.ru/);
    const isNumbers = new RegExp(/^[-+]?[0-9]+$/);

    if(cookies.url === value) {
      setError(true);
      setErrorMessage("?????????????? ?????????? ???????????? ???? ????????????????????");
      return;
    }

    if (!isUrl.test(value)) {
      setError(true);
      setErrorMessage("?????????????? ???????????? ???? ????????????????????");
      return;
    }
    if (!isNspu.test(value)) {
      setError(true);
      setErrorMessage("???????????? ???????????? ?????????? ???? ?????????? schedule.nspu.ru");
      return;
    }
    if (!hasHttps.test(value)) {
      setError(true);
      setErrorMessage("???????????? ???????????? ???????????????????? ?? https://");
      return;
    }
    if (!hasId.test(value) || !isNumbers.test(value.slice(value.lastIndexOf("=") + 1))) {
      setError(true);
      setErrorMessage("???????????? ???????????? ?????????????????????????? ???? id ???????????? ????????????????????");
      return;
    }
    setCookie('url', value, cookiesParams);
  }

  return (
    <div
      style={{padding: "72px 20px 0px 20px"}}
    >
      <Typography variant="h6" style={{marginBottom: 36, padding: "0 10px"}}>
        ?????????????? ?????????? ???????????? ???? ????????????????????
      </Typography>
      <div style={{marginBottom: 10, width: "100%"}}>
        <TextField
          id="outlined-basic"
          label="????????????"
          variant="outlined"
          error={error}
          helperText={errorMessage}
          value={value}
          onChange={recordInput}
          style={{width: "100%"}}
        />
      </div>
      <div style={{float: "right", marginRight: 20}}>
        <Button
          variant="contained"
          color="secondary"
          onClick={checkAndSet}
        >
          ????????????
        </Button>
      </div>
    </div>
  )
}

const ChangeTheme = () => {
  const [cookies, setCookie, removeCookie] = useCookies();
  const [primary, setPrimary] = useState(cookies.primary || "blue");
  const [secondary, setSecondary] = useState(cookies.secondary || "pink");

  const handlePrimary = async (e) => {
    setPrimary(e.target.value);
    await setCookie("primary", e.target.value, cookiesParams);
    await fuckingUseEffect();
  }
  const handleSecondary = async (e) => {
    setSecondary(e.target.value);
    await setCookie("secondary", e.target.value, cookiesParams);
    await fuckingUseEffect();
  }

  const fuckingUseEffect = async () => {
    if(cookies.theme) {
      await removeCookie("theme");
      await setCookie("theme", "Here_should_be_cookie_value", cookiesParams);
      return;
    }
    await setCookie("theme", "Here_should_be_cookie_value", cookiesParams);
    await removeCookie("theme");
  }

  return (
    <div
      style={{padding: "72px 60px 0px 60px"}}
    >
      <Button
        style={{
          height: "100%",
          width: "100%"
        }}
        variant="contained"
        color="primary"
        endIcon={!cookies.theme ? <NightsStayRounded /> : <WbSunnyRounded />}
        onClick={() => cookies.theme ? removeCookie("theme") : setCookie("theme", "Here_should_be_cookie_value", cookiesParams)}
      >
        {!cookies.theme ? "????????????" : "??????????????"}
      </Button>
      <Select
        style={{
          marginTop: 40,
          width: "45%"
        }}
        variant="outlined"
        value={primary}
        onChange={handlePrimary}
      >
        {Object.keys(colors).filter(key => key !== "common").map(key => <MenuItem value={key}>
            <LooksOneRounded style={{color: colors[key][600]}} />
            <LooksTwoRounded style={{color: colors[key][600]}} />
            <Looks3Rounded style={{color: colors[key][600]}} />
          </MenuItem>
        )}
      </Select>
      <Select
        style={{
          marginTop: 40,
          width: "45%",
          marginLeft: "10%"
        }}
        variant="outlined"
        value={secondary}
        onChange={handleSecondary}
      >
        {Object.keys(colors).filter(key => key !== "common").map(key => <MenuItem value={key} style={{color: colors[key][600]}}>
            <Looks4Rounded style={{color: colors[key][600]}} />
            <Looks5Rounded style={{color: colors[key][600]}} />
            <Looks6Rounded style={{color: colors[key][600]}} />
          </MenuItem>
        )}
      </Select>
    </div>
  );
}

const AskMeHelp = () => {
  return (
    <div
      style={{padding: "72px 40px 0px 40px"}}
    >
      <Typography variant="h6">
       ???????? ???? ???? ???? ???????????????? ?? ???? ???? ?????????????? ???????????? ???????????????? ????????????????????????????, ???????????????? ???????????? ?? ?????????????????? ?????????????????? ???????????????? ?? ?????????????? (!!!) ???? ?????????? <a href="mailto:support@nspu-schedule.ru" style={{color: "inherit"}}>support@nspu-schedule.ru</a>. ???????????? ?????? ???????????? ???????????? ?????????????? ?????????????????????? (@_@).
      </Typography>
    </div>
  )
}