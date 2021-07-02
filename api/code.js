module.exports = async (req, res) => {
    const code = req?.query?.code;
    res.status(200);
    if (!code) {res.send({status: false}); return;}
    let data = codes[code];
    if (!data) {res.send({status: false}); return;}
    res.send({status: true, ...data})
}

const codes = {
    "1110": {img: "/df8skdfjhj48hsjdf.gif"},
    "0411": {text: [
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
    "1984": {text: ["Большой брат следит за тобой"]},
    "5401": {img: "/xicm67HeOs.jpeg"},
}