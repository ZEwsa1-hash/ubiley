export type ProgramItem = {
  time: string
  title: string
  note: string
}

export type Contact = {
  role: string
  name: string
  phone: string
  phoneLink: string
  whatsApp: string
}

export const eventConfig = {
  celebrant: 'Карина',
  age: 35,
  dateISO: '2026-10-24T17:00:00+05:00',
  dateLabel: '24 октября 2026',
  timeLabel: '17:00',
  timeZone: 'Asia/Yekaterinburg',
  rsvpDeadline: '1 октября 2026',
  program: [
    { time: '17:00', title: 'Welcome-зона', note: 'Встречаемся, обнимаемся и настраиваемся на чудеса' },
    { time: '18:00', title: 'Банкет', note: 'Праздничный ужин и тёплые слова' },
    { time: '22:30', title: 'Финал вечера', note: 'Красивое завершение основной программы' },
    { time: '23:00', title: 'Караоке-сюрприз', note: 'Продолжаем петь и веселиться до утра' },
  ] satisfies ProgramItem[],
  venue: {
    name: 'Панорама Аморе',
    type: 'банкетный зал',
    address: 'ул. Чапаева, 96Б, посёлок Смолино, Челябинск',
    mapUrl: 'https://yandex.ru/maps/?text=%D0%9F%D0%B0%D0%BD%D0%BE%D1%80%D0%B0%D0%BC%D0%B0%20%D0%90%D0%BC%D0%BE%D1%80%D0%B5%2C%20%D0%A7%D0%B0%D0%BF%D0%B0%D0%B5%D0%B2%D0%B0%2096%D0%91%2C%20%D0%A1%D0%BC%D0%BE%D0%BB%D0%B8%D0%BD%D0%BE%2C%20%D0%A7%D0%B5%D0%BB%D1%8F%D0%B1%D0%B8%D0%BD%D1%81%D0%BA',
  },
  dressCode: {
    title: 'Восточная сказка',
    description: 'Приветствуются восточные наряды, струящиеся ткани, глубокие оттенки и яркие аксессуары.',
  },
  contacts: [
    { role: 'Организатор', name: 'Кристина', phone: '+7 996 946-49-52', phoneLink: '+79969464952', whatsApp: '79969464952' },
    { role: 'Ведущий', name: 'Николай', phone: '+7 951 111-11-03', phoneLink: '+79511111103', whatsApp: '79511111103' },
  ] satisfies Contact[],
} as const
