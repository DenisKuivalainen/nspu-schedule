module.exports = async (req, res) => {
    const code = req?.query?.code;
    res.status(200);
    if (!code) {res.send({status: false}); return;}
    let data = codes[code];
    if (!data || !(data.text || data.img)) {res.send({status: false}); return;}
    res.send({status: true, ...data})
}

const codes = {
    "1110": {img: "/df8skdfjhj48hsjdf.gif"},
    "7984": {text: [
        "Ужели ты не помнишь изреченья",
        "Из Этики, что пагубней всего",
        "Три ненавистных Небесам влеченья",
        "И что несдерженость - меньший грех",
        "пред Богом,",
        "И Он не так карает за него?",
        "~~~",
        "Данте, Ад, Песнь Одиннадцатая, строки 79-84"
    ]},
    "8013": {text: ["Who is mr. P? Is he a jelly banana?", "(@_@)"]},
    "6000": {text: ["Go go Power Rangers!!!1!"]},
    "1984": {img: "/917kCB40HwaPwsqvI342Q.png"},
    "5401": {img: "/xicm67HeOs.jpeg"},
    "3009": {text: ["Brother.", "Beggar.", "King."]},
    "6395": {text: [
        "К слову, я никогда не был в Новосибирске :/",
        "Да и в целом я восточнее Москвы не был...",
        "Зачем я создал это приложение?"
    ]},
    "0411": {text: ["I am GODLIKE!"]},
    "0000": {text: ["The quick brown fox jumped over the lazy dog"]},
    "2907": {text: ["I just want to be happy..."]}
}