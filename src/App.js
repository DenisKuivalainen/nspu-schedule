import logo from './logo.svg';
import './App.css';
import { useEffect, useMemo, useState } from 'react';
import ex from './ex.json';
import { useCookies } from 'react-cookie';
import { AppBar, Box, Button, ButtonGroup, Card, Container, createMuiTheme, CssBaseline, Grid, LinearProgress, Paper, Tab, Tabs, TextField, ThemeProvider, Typography, useTheme } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';
import * as colors from '@material-ui/core/colors';
import { ReplayRounded } from '@material-ui/icons';

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
    // // TEST \/
    // await setData(ex);
    // await setLoaded(true);
    // return;
    // // TEST /\
    try {
      const res = await fetch('/schedule');
      if(!res.ok) return;
      const resData = await res.json();
      await setData(resData);
      setLoaded(true);
    } catch (e) {
      console.error(e);
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

const NotFetched = ({reload}) => (
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
    </div>
  </div>
)

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
    return `${days[d][0]}, ${w === 0 ? "числитель" : "знаменатель"}`
  }

  return (
    <>
      <AppBar position="static" style={{height: 48}}>
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
        <TabPannel value={value} index={0} dir={theme.direction}>
          <p>
            {title}
          </p>
          {ttl && ttl.map(val => {
            if (!val[1]) return;
            return (<p>
              {val[0]}
              <div dangerouslySetInnerHTML={{__html: val[1]}}></div>
            </p>)
          })}
        </TabPannel>
        <TabPannel value={value} index={1} dir={theme.direction}>
          <Days
            day={day} setDay={setDay}
            week={data.week.type} setWeek={setWeek}
          />
        </TabPannel>
      </SwipeableViews>
    </>
  );
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