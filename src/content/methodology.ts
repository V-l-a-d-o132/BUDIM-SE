import resource from '../../content/methodology-resource.json';

export const methodology = {
  ...resource,
  sizeLabel: `${Math.ceil(resource.bytes / 1024)} KB`,
  studentPackSizeLabel: `${Math.ceil(resource.studentPack.bytes / 1024)} KB`,
  steps: [
    { name: 'Наблюдение', question: 'Какво точно се случи? Отделяме видимото действие от собствената реакция и предположението.' },
    { name: 'Проверка', question: 'Какво знаем и откъде? Търсим първоизточника, датата, контекста и разумните алтернативи.' },
    { name: 'Избор', question: 'Какво има смисъл да направим? Определяме цел и малка, изпълнима следваща стъпка.' },
    { name: 'Опит', question: 'Как ще разберем дали помага? Уточняваме условията, срока и какво ще наблюдаваме.' },
    { name: 'Преглед', question: 'Какво научихме? Записваме резултата, ограниченията и какво бихме променили.' },
  ],
};
