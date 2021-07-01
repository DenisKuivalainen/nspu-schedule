import logo from './logo.svg';
import './App.css';
import { useEffect, useMemo, useState } from 'react';
import ex from './ex.json';
import { useCookies } from 'react-cookie';
import { AppBar, Box, Button, ButtonGroup, Card, Container, createMuiTheme, CssBaseline, FormControlLabel, Grid, LinearProgress, Paper, Switch, Tab, Tabs, TextField, ThemeProvider, Typography, useTheme } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';
import * as colors from '@material-ui/core/colors';
import { ReplayRounded } from '@material-ui/icons';
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
    // TEST \/
    // await setData(ex);
    // await setLoaded(true);
    // return;
    // TEST /\
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
    [cookies.theme],
  );  

  return(
    <ThemeProvider theme={theme}>
      <PWAPrompt
        copyTitle="Добавьте на рабочий стол"
        copyBody="Данная страница может функционировать как приложение. Добавьте ее на рабочий стол и используйте в полноэкранном режиме."
        copyShareButtonLabel="1) Нажмите кнопку «Поделиться» в строке меню ниже."
        copyAddHomeButtonLabel="2) Нажмите «Добавить на главный экран»."
        copyClosePrompt="Закрыть"
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
      setErrorMessage("Введите ссылку на расписание");
      return;
    }
    if (!isNspu.test(value)) {
      setError(true);
      setErrorMessage("Ссылка должна вести на домен schedule.nspu.ru");
      return;
    }
    if (!hasHttps.test(value)) {
      setError(true);
      setErrorMessage("Ссылка должна начинаться с https://");
      return;
    }
    if (!hasId.test(value) || !isNumbers.test(value.slice(value.lastIndexOf("=") + 1))) {
      setError(true);
      setErrorMessage("Ссылка должна заканчиваться на id вышего расписания");
      return;
    }
    setCookie('url', value, cookiesParams);
  }

  return(
    <div
      style={{padding: "72px 20px 0px 20px"}}
    >
      <Typography variant="h6" style={{marginBottom: 36, padding: "0 10px"}}>
        Введите ссылку на расписание
      </Typography>
      <div style={{marginBottom: 10, width: "100%"}}>
        <TextField
          id="outlined-basic"
          label="Ссылка"
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
          Ввести
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
        Не удалось загрузить расписание
      </Typography>
      <div style={{float: "right", marginRight: 20}}>
        <Button
          variant="contained"
          color="primary"
          onClick={reload}
          startIcon={<ReplayRounded />}
        >
          Попробовать снова
        </Button>
        <Typography variant="h6" style={{marginBottom: 10, marginTop: 10, padding: "0 10px", textAlign: "center"}}>
          или
        </Typography>
        <Button
          variant="contained"
          color="primary"
          style={{width: "100%"}}
          onClick={() => removeCookie('url')}
        >
          Ввести ссылку снова
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
    console.log(data.days[days[today][1]], data.week.type);
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
    return `${days[d][0]}, ${w === 0 ? "числитель" : "знаменатель"}`
  }

  const [checked, setChecked] = useState(false);
  useEffect(() => {
    checked ? setCookie('current', 'TATAKAE!', cookiesParams) : removeCookie('current')
  }, [checked])

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
          <Tab label="Расписание" {...a11yProps(0)}/>
          <Tab label="Выбор дня" {...a11yProps(1)}/>
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
            <a href={cookies.url}>Открыть оригинал</a>
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
            label="Показать на сегодня (beta)"
            labelPlacement="start"
          />
        )}
        {value === 1 && (
          <p></p>
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
  ["Понедельник", "mo"],
  ["Вторник", "ti"],
  ["Среда", "ke"],
  ["Четверг", "to"],
  ["Пятница", "pe"],
  ["Суббота", "la"]
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
                  Числитель
                </Button>
                <Button
                  style={{width: "50%"}}
                  color={week === 1 && today ? "secondary" : "default"}
                  onClick={() => setWeek(1)}
                >
                  Знаменатель
                </Button>
              </ButtonGroup>
            )}
          </ Grid>
        )
      })}
    </Grid>
  );
}