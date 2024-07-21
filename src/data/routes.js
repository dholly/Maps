// routes.js
export const routes = [
    {
        id: 1,
        name: 'Томский маршрут',
        description: 'Живописный маршрут через исторический центр Томска',
        coordinates: [[85.03429026520088,56.517181708681754],[85.03960313175844,56.51163353780577],[85.00028791923246,56.500861230997515],[84.9800990263137,56.50020826514399]],
        color: '#FF5733',
        distance: '5.2 км',
        duration: '1 час 30 минут',
        district: 'Октябрьский район',
        price: true,
        pointsOfInterest: [
            {
                title: 'улица Сергея Лазо, 18',
                coordinates: [85.035172, 56.517832]
            },
            {
                title: 'Набережная реки Томь',
                coordinates: [84.963648, 56.495693]
            },
            {
                title: 'Воскресенская гора',
                coordinates: [84.956102, 56.494356]
            }
        ],
        imageUrl: 'template-photo.png',
        likes: 124,
        createdAt: '2023-05-15',

        steps: [
            {
                title: 'Начало маршрута',
                description: 'Отправная точка - улица Сергея Лазо, 18',
                image: 'step1.jpg'
            },
            {
                title: 'Набережная реки Томь',
                description: 'Прогулка вдоль живописной набережной',
                image: 'step2.jpg'
            },
            {
                title: 'Воскресенская гора',
                description: 'Подъем на историческую Воскресенскую гору',
                image: 'step3.jpg'
            }
        ]
    },
    {
        id: 2,
        name: 'Петербургская прогулка',
        description: 'Классический маршрут по центру Санкт-Петербурга',
        coordinates: [
            [30.3242, 59.9242],
            [30.3342, 59.9242],
            [30.3342, 59.9342],
            [30.3442, 59.9342]
        ],
        color: '#33FF57',
        distance: '3.5 км',
        duration: '2 часа',
        district: 'Центральный район',
        price: true,
        pointsOfInterest: [
            {
                title: 'Эрмитаж',
                coordinates: [30.3142, 59.9399]
            },
            {
                title: 'Невский проспект',
                coordinates: [30.3442, 59.9342]
            },
            {
                title: 'Казанский собор',
                coordinates: [30.3242, 59.9342]
            }
        ],
        imageUrl: 'template-photo.png',
        likes: 256,
        createdAt: '2023-06-22'
    },
    {
        id: 3,
        name: 'Московский квест',
        description: 'Увлекательный маршрут по историческим местам Москвы',
        coordinates: [
            [37.6174, 55.7520],
            [37.6204, 55.7539],
            [37.6228, 55.7546],
            [37.6249, 55.7544]
        ],
        color: '#5733FF',
        distance: '4.7 км',
        duration: '2 часа 30 минут',
        district: 'Центральный округ',
        price: false,
        pointsOfInterest: [
            {
                title: 'Красная площадь',
                coordinates: [37.6204, 55.7539]
            },
            {
                title: 'Большой театр',
                coordinates: [37.6188, 55.7601]
            },
            {
                title: 'Парк Зарядье',
                coordinates: [37.6286, 55.7516]
            }
        ],
        imageUrl: 'template-photo.png',
        likes: 198,
        createdAt: '2023-07-10'
    }
];