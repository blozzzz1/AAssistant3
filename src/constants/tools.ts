export interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'business';
  icon: string;
  color: string;
  fields: ToolField[];
  systemPrompt: string;
}

export interface ToolField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  maxLength?: number;
}

export const TOOLS: Tool[] = [
  // Генерация контента
  {
    id: 'article-generator',
    name: 'Генератор статей',
    description: 'Создание полноценных статей и постов на заданную тему',
    category: 'content',
    icon: 'FileText',
    color: 'from-blue-500 to-cyan-500',
    fields: [
      {
        id: 'topic',
        label: 'Тема статьи',
        type: 'text',
        placeholder: 'Например: "Искусственный интеллект в медицине"',
        required: true,
        maxLength: 200
      },
      {
        id: 'length',
        label: 'Длина статьи',
        type: 'select',
        required: true,
        options: [
          { value: 'short', label: 'Короткая (300-500 слов)' },
          { value: 'medium', label: 'Средняя (500-1000 слов)' },
          { value: 'long', label: 'Длинная (1000+ слов)' }
        ]
      },
      {
        id: 'style',
        label: 'Стиль написания',
        type: 'select',
        options: [
          { value: 'formal', label: 'Формальный' },
          { value: 'casual', label: 'Неформальный' },
          { value: 'professional', label: 'Профессиональный' },
          { value: 'creative', label: 'Креативный' }
        ]
      },
      {
        id: 'additional',
        label: 'Дополнительные требования (опционально)',
        type: 'textarea',
        placeholder: 'Укажите структуру, ключевые моменты, целевую аудиторию...',
        maxLength: 500
      }
    ],
    systemPrompt: 'Ты профессиональный копирайтер и журналист. Создавай качественные, информативные и интересные статьи.'
  },
  {
    id: 'translator',
    name: 'Переводчик с контекстом',
    description: 'Перевод текста с сохранением стиля и тона оригинала',
    category: 'content',
    icon: 'Languages',
    color: 'from-purple-500 to-pink-500',
    fields: [
      {
        id: 'text',
        label: 'Текст для перевода',
        type: 'textarea',
        placeholder: 'Введите текст, который нужно перевести',
        required: true,
        maxLength: 5000
      },
      {
        id: 'targetLanguage',
        label: 'Язык перевода',
        type: 'select',
        required: true,
        options: [
          { value: 'en', label: 'Английский' },
          { value: 'ru', label: 'Русский' },
          { value: 'es', label: 'Испанский' },
          { value: 'fr', label: 'Французский' },
          { value: 'de', label: 'Немецкий' },
          { value: 'zh', label: 'Китайский' },
          { value: 'ja', label: 'Японский' }
        ]
      },
      {
        id: 'style',
        label: 'Стиль перевода',
        type: 'select',
        options: [
          { value: 'preserve', label: 'Сохранить оригинальный стиль' },
          { value: 'formal', label: 'Формальный' },
          { value: 'casual', label: 'Неформальный' },
          { value: 'literary', label: 'Литературный' }
        ]
      }
    ],
    systemPrompt: 'Ты профессиональный переводчик. Переводи текст, сохраняя стиль, тон и контекст оригинала. Учитывай культурные особенности и идиомы.'
  },
  {
    id: 'text-editor',
    name: 'Редактор текста',
    description: 'Исправление ошибок, улучшение стиля и перефразирование',
    category: 'content',
    icon: 'Edit',
    color: 'from-green-500 to-emerald-500',
    fields: [
      {
        id: 'text',
        label: 'Текст для редактирования',
        type: 'textarea',
        placeholder: 'Введите текст, который нужно отредактировать',
        required: true,
        maxLength: 5000
      },
      {
        id: 'action',
        label: 'Тип редактирования',
        type: 'select',
        required: true,
        options: [
          { value: 'fix', label: 'Исправить ошибки' },
          { value: 'improve', label: 'Улучшить стиль' },
          { value: 'paraphrase', label: 'Перефразировать' },
          { value: 'all', label: 'Все вышеперечисленное' }
        ]
      },
      {
        id: 'tone',
        label: 'Тон текста',
        type: 'select',
        options: [
          { value: 'keep', label: 'Сохранить оригинальный' },
          { value: 'professional', label: 'Профессиональный' },
          { value: 'friendly', label: 'Дружелюбный' },
          { value: 'formal', label: 'Формальный' }
        ]
      }
    ],
    systemPrompt: 'Ты профессиональный редактор текстов. Исправляй ошибки, улучшай стиль и перефразируй текст, сохраняя смысл и улучшая читаемость.'
  },
  {
    id: 'idea-generator',
    name: 'Генератор идей',
    description: 'Генерация идей для контента, проектов и названий',
    category: 'content',
    icon: 'Lightbulb',
    color: 'from-yellow-500 to-orange-500',
    fields: [
      {
        id: 'type',
        label: 'Тип идей',
        type: 'select',
        required: true,
        options: [
          { value: 'content', label: 'Идеи для контента' },
          { value: 'project', label: 'Идеи для проектов' },
          { value: 'names', label: 'Названия' },
          { value: 'topics', label: 'Темы для статей' },
          { value: 'headlines', label: 'Заголовки' }
        ]
      },
      {
        id: 'topic',
        label: 'Тема/Область',
        type: 'text',
        placeholder: 'Например: "Технологии", "Маркетинг", "Образование"',
        required: true,
        maxLength: 200
      },
      {
        id: 'count',
        label: 'Количество идей',
        type: 'select',
        required: true,
        options: [
          { value: '5', label: '5 идей' },
          { value: '10', label: '10 идей' },
          { value: '15', label: '15 идей' },
          { value: '20', label: '20 идей' }
        ]
      }
    ],
    systemPrompt: 'Ты креативный генератор идей. Создавай уникальные, интересные и практичные идеи, которые вдохновляют и мотивируют.'
  },
  // Бизнес и продуктивность
  {
    id: 'business-plan',
    name: 'Генератор бизнес-планов',
    description: 'Создание структурированных бизнес-планов',
    category: 'business',
    icon: 'Briefcase',
    color: 'from-indigo-500 to-purple-500',
    fields: [
      {
        id: 'businessName',
        label: 'Название бизнеса',
        type: 'text',
        placeholder: 'Название вашего бизнеса или проекта',
        required: true,
        maxLength: 100
      },
      {
        id: 'industry',
        label: 'Отрасль',
        type: 'text',
        placeholder: 'Например: IT, ресторанный бизнес, образование',
        required: true,
        maxLength: 100
      },
      {
        id: 'description',
        label: 'Описание бизнеса',
        type: 'textarea',
        placeholder: 'Опишите ваш бизнес, продукт или услугу',
        required: true,
        maxLength: 1000
      },
      {
        id: 'targetAudience',
        label: 'Целевая аудитория',
        type: 'textarea',
        placeholder: 'Опишите вашу целевую аудиторию',
        maxLength: 500
      },
      {
        id: 'goals',
        label: 'Цели и задачи',
        type: 'textarea',
        placeholder: 'Какие цели вы хотите достичь?',
        maxLength: 500
      }
    ],
    systemPrompt: 'Ты бизнес-консультант и эксперт по бизнес-планированию. Создавай детальные, структурированные и профессиональные бизнес-планы.'
  },
  {
    id: 'document-analyzer',
    name: 'Анализ документов',
    description: 'Извлечение ключевой информации из документов',
    category: 'business',
    icon: 'FileSearch',
    color: 'from-blue-500 to-indigo-500',
    fields: [
      {
        id: 'document',
        label: 'Текст документа',
        type: 'textarea',
        placeholder: 'Вставьте текст документа для анализа',
        required: true,
        maxLength: 10000
      },
      {
        id: 'analysisType',
        label: 'Тип анализа',
        type: 'select',
        required: true,
        options: [
          { value: 'summary', label: 'Краткое резюме' },
          { value: 'keyPoints', label: 'Ключевые моменты' },
          { value: 'insights', label: 'Инсайты и выводы' },
          { value: 'actionItems', label: 'Задачи и действия' },
          { value: 'full', label: 'Полный анализ' }
        ]
      },
      {
        id: 'focus',
        label: 'Фокус анализа (опционально)',
        type: 'text',
        placeholder: 'На что обратить особое внимание?',
        maxLength: 200
      }
    ],
    systemPrompt: 'Ты эксперт по анализу документов. Извлекай ключевую информацию, находи важные моменты и предоставляй структурированный анализ.'
  },
  {
    id: 'email-generator',
    name: 'Генератор email',
    description: 'Создание профессиональных писем',
    category: 'business',
    icon: 'Mail',
    color: 'from-pink-500 to-rose-500',
    fields: [
      {
        id: 'purpose',
        label: 'Цель письма',
        type: 'select',
        required: true,
        options: [
          { value: 'business', label: 'Деловое письмо' },
          { value: 'proposal', label: 'Коммерческое предложение' },
          { value: 'follow-up', label: 'Последующее письмо' },
          { value: 'introduction', label: 'Знакомство' },
          { value: 'complaint', label: 'Жалоба' },
          { value: 'thank', label: 'Благодарность' },
          { value: 'invitation', label: 'Приглашение' }
        ]
      },
      {
        id: 'recipient',
        label: 'Получатель',
        type: 'text',
        placeholder: 'Кому адресовано письмо?',
        maxLength: 100
      },
      {
        id: 'context',
        label: 'Контекст и детали',
        type: 'textarea',
        placeholder: 'Опишите ситуацию, что нужно сообщить, какие детали важны',
        required: true,
        maxLength: 1000
      },
      {
        id: 'tone',
        label: 'Тон письма',
        type: 'select',
        options: [
          { value: 'formal', label: 'Формальный' },
          { value: 'professional', label: 'Профессиональный' },
          { value: 'friendly', label: 'Дружелюбный' },
          { value: 'casual', label: 'Неформальный' }
        ]
      }
    ],
    systemPrompt: 'Ты эксперт по деловой переписке. Создавай профессиональные, вежливые и эффективные email письма.'
  },
  {
    id: 'task-planner',
    name: 'Планировщик задач',
    description: 'Разбивка больших задач на управляемые шаги',
    category: 'business',
    icon: 'CheckSquare',
    color: 'from-green-500 to-teal-500',
    fields: [
      {
        id: 'task',
        label: 'Задача или проект',
        type: 'textarea',
        placeholder: 'Опишите задачу или проект, который нужно разбить на шаги',
        required: true,
        maxLength: 1000
      },
      {
        id: 'deadline',
        label: 'Срок выполнения (опционально)',
        type: 'text',
        placeholder: 'Например: "2 недели", "1 месяц", "3 дня"',
        maxLength: 50
      },
      {
        id: 'priority',
        label: 'Приоритет',
        type: 'select',
        options: [
          { value: 'high', label: 'Высокий' },
          { value: 'medium', label: 'Средний' },
          { value: 'low', label: 'Низкий' }
        ]
      },
      {
        id: 'resources',
        label: 'Доступные ресурсы (опционально)',
        type: 'textarea',
        placeholder: 'Какие ресурсы, инструменты или команда доступны?',
        maxLength: 500
      }
    ],
    systemPrompt: 'Ты эксперт по планированию и управлению проектами. Разбивай большие задачи на конкретные, выполнимые шаги с четкими действиями.'
  },
  {
    id: 'swot-analysis',
    name: 'SWOT-анализ',
    description: 'Автоматический анализ проектов и бизнес-идей',
    category: 'business',
    icon: 'TrendingUp',
    color: 'from-orange-500 to-red-500',
    fields: [
      {
        id: 'projectName',
        label: 'Название проекта/бизнеса',
        type: 'text',
        placeholder: 'Название проекта или бизнес-идеи',
        required: true,
        maxLength: 100
      },
      {
        id: 'description',
        label: 'Описание проекта',
        type: 'textarea',
        placeholder: 'Подробно опишите проект, бизнес-идею или ситуацию для анализа',
        required: true,
        maxLength: 2000
      },
      {
        id: 'context',
        label: 'Контекст (опционально)',
        type: 'textarea',
        placeholder: 'Дополнительная информация: рынок, конкуренты, ресурсы и т.д.',
        maxLength: 1000
      }
    ],
    systemPrompt: 'Ты бизнес-аналитик и эксперт по SWOT-анализу. Проводи детальный анализ, выявляя сильные и слабые стороны, возможности и угрозы.'
  }
];

