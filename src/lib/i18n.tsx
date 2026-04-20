import React, { createContext, useContext, useState, ReactNode } from 'react';

export const languages = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Hindi', 'Arabic', 'Portuguese', 'Russian'
];

type Translations = Record<string, Record<string, string>>;

export const translations: Translations = {
  "Welcome to AuraScan": {
    English: "Welcome to AuraScan", Spanish: "Bienvenido a AuraScan", French: "Bienvenue sur AuraScan", Portuguese: "Bem-vindo ao AuraScan"
  },
  "Your professional AI biometric health companion. Let's get you started with a quick overview of how we help you track your wellness.": {
    English: "Your smart friend for a healthy life. Let's see how we can help you stay well.",
    Spanish: "Tu amigo inteligente para una vida saludable.",
    French: "Votre ami intelligent pour une vie saine.",
    Portuguese: "Seu amigo inteligente para uma vida saudável."
  },
  "The Scanning Process": {
    English: "How to Scan", Spanish: "Cómo escanear", French: "Comment scanner", Portuguese: "Como Escanear"
  },
  "Position your face in good lighting. AuraScan uses advanced computer vision to map 468+ landmarks for precise biometric analysis.": {
    English: "Position your face in a bright spot. We scan your face to see how you are doing.",
    Spanish: "Ponte en un lugar iluminado. Escaneamos tu cara para ver cómo estás.",
    French: "Placez votre visage dans un endroit lumineux. Nous scannons votre visage.",
    Portuguese: "Posicione seu rosto sob boa iluminação. Escaneamos seu rosto."
  },
  "Result Interpretation": {
    English: "See Your Results", Spanish: "Ver tus resultados", French: "Voir vos résultats", Portuguese: "Ver Seus Resultados"
  },
  "Receive instant insights on hydration, stress, and vitality markers, correlated with evidence-based wellness recommendations.": {
    English: "Get quick tips on your water levels, stress, and energy to help you feel your best.",
    Spanish: "Obtén consejos rápidos para sentirte mejor.",
    French: "Obtenez des conseils rapides pour vous sentir mieux.",
    Portuguese: "Receba dicas rápidas para se sentir melhor."
  },
  "Language": {
    English: "Language", Spanish: "Idioma", French: "Langue", German: "Sprache", Chinese: "语言", Japanese: "言語", Hindi: "भाषा", Arabic: "اللغة", Portuguese: "Idioma", Russian: "Язык"
  },
  "Hydration": {
    English: "Water", Spanish: "Agua", French: "Eau", Portuguese: "Água"
  },
  "Stress": {
    English: "Relaxation", Spanish: "Relajación", French: "Relaxation", Portuguese: "Relaxamento"
  },
  "Vitality": {
    English: "Energy", Spanish: "Energía", French: "Énergie", Portuguese: "Energia"
  },
  "Capillary": {
    English: "Blood Flow", Spanish: "Flujo sanguíneo", French: "Flux sanguin", Portuguese: "Fluxo Sanguíneo"
  },
  "Dermal": {
    English: "Skin", Spanish: "Piel", French: "Peau", Portuguese: "Pele"
  },
  "History": {
    English: "History", Spanish: "Historial", French: "Historique", German: "Verlauf", Chinese: "历史", Japanese: "履歴", Hindi: "इतिहास", Arabic: "السجل", Portuguese: "Histórico", Russian: "История"
  },
  "Logout": {
    English: "Logout", Spanish: "Cerrar sesión", French: "Déconnexion", German: "Abmelden", Chinese: "登出", Japanese: "ログアウト", Hindi: "लॉग आउट", Arabic: "تسجيل الخروج", Portuguese: "Sair", Russian: "Выйти"
  },
  "Sign in to Save Scans": {
    English: "Sign in to Save Scans", Spanish: "Inicia sesión para guardar", French: "Connectez-vous pour enregistrer", German: "Anmelden zum Speichern", Chinese: "登录以保存扫描", Japanese: "ログインして保存", Hindi: "स्कैन सहेजने के लिए साइन इन करें", Arabic: "تسجيل الدخول لحفظ الفحوصات", Portuguese: "Faça login para salvar", Russian: "Войдите, чтобы сохранить"
  },
  "AI-Powered Biometrics": {
    English: "Smart Health Scan", Spanish: "Escaneo de salud inteligente", French: "Scan santé intelligent", German: "Intelligenter Gesundheitsscan", Chinese: "智能健康扫描", Japanese: "スマートヘルススキャン", Hindi: "स्मार्ट हेल्थ स्कैन", Arabic: "الفحص الصحي الذكي", Portuguese: "Scan de Saúde Inteligente", Russian: "Умное сканирование здоровья"
  },
  "Advanced facial analysis for full-body wellness insights and personalized health recommendations.": {
    English: "Scan your face to see how your body is feeling and get easy tips to feel better.",
    Spanish: "Escanea tu rostro para ver cómo te sientes y obtén consejos para mejorar.",
    French: "Scannez votre visage pour voir comment vous vous sentez et obtenez des conseils.",
    German: "Scannen Sie Ihr Gesicht, um zu sehen, wie es Ihnen geht, und erhalten Sie Tipps.",
    Chinese: "扫描面部，了解身体状况并获取改善建议。",
    Japanese: "顔をスキャンして体の調子を確認し、改善のためのヒントを得ましょう。",
    Hindi: "अपने चेहरे को स्कैन करें और बेहतर महसूस करने के लिए आसान टिप्स प्राप्त करें।",
    Arabic: "افحص وجهك لترى كيف يشعر جسمك واحصل على نصائح سهلة لتشعر بتحسن.",
    Portuguese: "Escaneie seu rosto para ver como seu corpo está se sentindo e receba dicas.",
    Russian: "Отсканируйте свое лицо, чтобы узнать самочувствие и получить советы."
  },
  "Daily Wellness Insight": {
    English: "Daily Wellness Insight", Spanish: "Consejo de bienestar diario", French: "Aperçu bien-être quotidien", German: "Täglicher Wellness-Einblick", Chinese: "每日健康洞察", Japanese: "毎日のウェルネスインサイト", Hindi: "दैनिक कल्याण अंतर्दृष्टि", Arabic: "رؤية العافية اليومية", Portuguese: "Insight Diário de Bem-Estar", Russian: "Ежедневный обзор здоровья"
  },
  "Based on your last scan, focus on": {
    English: "Based on your last scan, focus on", Spanish: "Según tu último escaneo, concéntrate en", French: "D'après votre dernier scan, concentrez-vous sur", German: "Basierend auf Ihrem letzten Scan, konzentrieren Sie sich auf", Chinese: "根据您上次的扫描，请关注", Japanese: "前回のスキャンに基づき、以下に注目してください：", Hindi: "आपके पिछले स्कैन के आधार पर, इस पर ध्यान दें:", Arabic: "بناءً على الفحص الأخير، ركز على", Portuguese: "Com base no seu último scan, foque em", Russian: "Основываясь на вашем последнем сканировании, сосредоточьтесь на"
  },
  "today.": {
    English: "today.", Spanish: "hoy.", French: "aujourd'hui.", German: "heute.", Chinese: "今天。", Japanese: "今日。", Hindi: "आज。", Arabic: "اليوم.", Portuguese: "hoje.", Russian: "сегодня."
  },
  "Start Health Scan": {
    English: "Start Health Scan", Spanish: "Iniciar escaneo de salud", French: "Démarrer le scan de santé", German: "Gesundheitsscan starten", Chinese: "开始健康扫描", Japanese: "ヘルススキャンを開始", Hindi: "स्वास्थ्य स्कैन शुरू करें", Arabic: "بدء الفحص الصحي", Portuguese: "Iniciar Scan de Saúde", Russian: "Начать сканирование здоровья"
  },
  "Requires camera access for facial analysis": {
    English: "Requires camera access for facial analysis", Spanish: "Requiere acceso a la cámara para el análisis facial", French: "Nécessite l'accès à la caméra pour l'analyse faciale", German: "Erfordert Kamerazugriff für die Gesichtsanalyse", Chinese: "需要相机权限以进行面部分析", Japanese: "顔分析にはカメラへのアクセスが必要です", Hindi: "चेहरे के विश्लेषण के लिए कैमरा एक्सेस की आवश्यकता है", Arabic: "يتطلب الوصول إلى الكاميرا لتحليل الوجه", Portuguese: "Requer acesso à câmera para análise facial", Russian: "Требуется доступ к камере для анализа лица"
  },
  "Accuracy Tip: Perfect Lighting": {
    English: "Accuracy Tip: Perfect Lighting", Spanish: "Consejo de precisión: Iluminación perfecta", French: "Astuce précision : Éclairage parfait", German: "Genauigkeits-Tipp: Perfekte Beleuchtung", Chinese: "准确度提示：完美的照明", Japanese: "精度のヒント：完璧な照明", Hindi: "सटीकता टिप: सही प्रकाश व्यवस्था", Arabic: "نصيحة الدقة: إضاءة مثالية", Portuguese: "Dica de Precisão: Iluminação Perfeita", Russian: "Совет по точности: Идеальное освещение"
  },
  "Face the Light": {
    English: "Face the Light", Spanish: "Mira hacia la luz", French: "Face à la lumière", German: "Ins Licht schauen", Chinese: "面向光源", Japanese: "光に向かって", Hindi: "प्रकाश का सामना करें", Arabic: "واجه الضوء", Portuguese: "Encare a Luz", Russian: "Лицом к свету"
  },
  "Position yourself towards a window or lamp.": {
    English: "Position yourself towards a window or lamp.", Spanish: "Posiciónate hacia una ventana o lámpara.", French: "Placez-vous face à une fenêtre ou une lampe.", German: "Positionieren Sie sich zu einem Fenster oder einer Lampe.", Chinese: "将自己面向窗户或灯光。", Japanese: "窓やランプの方を向いてください。", Hindi: "खुद को खिड़की या दीपक की ओर रखें।", Arabic: "ضع نفسك باتجاه نافذة أو مصباح.", Portuguese: "Posicione-se de frente para uma janela ou lâmpada.", Russian: "Встаньте лицом к окну или лампе."
  },
  "No Shadows": {
    English: "No Shadows", Spanish: "Sin sombras", French: "Pas d'ombres", German: "Keine Schatten", Chinese: "没有阴影", Japanese: "影がないこと", Hindi: "कोई छाया नहीं", Arabic: "بدون ظلال", Portuguese: "Sem Sombras", Russian: "Без теней"
  },
  "Ensure even lighting across your entire face.": {
    English: "Ensure even lighting across your entire face.", Spanish: "Asegura una iluminación uniforme en todo tu rostro.", French: "Assurez un éclairage uniforme sur tout votre visage.", German: "Sorgen Sie für eine gleichmäßige Beleuchtung Ihres gesamten Gesichts.", Chinese: "确保整个面部光线均匀。", Japanese: "顔全体に均等な光が当たるようにしてください。", Hindi: "सुनिश्चित करें कि आपके पूरे चेहरे पर समान प्रकाश हो।", Arabic: "تأكد من إضاءة متساوية على وجهك بالكامل.", Portuguese: "Garanta uma iluminação uniforme em todo o seu rosto.", Russian: "Обеспечьте равномерное освещение всего лица."
  },
  "Secure Analysis": {
    English: "Secure Analysis", Spanish: "Análisis seguro", French: "Analyse sécurisée", German: "Sichere Analyse", Chinese: "安全分析", Japanese: "安全な分析", Hindi: "सुरक्षित विश्लेषण", Arabic: "تحليل آمن", Portuguese: "Análise Segura", Russian: "Безопасный анализ"
  },
  "Your biometric data is processed securely and never stored on our servers.": {
    English: "Your biometric data is processed securely and never stored on our servers.", Spanish: "Tus datos biométricos se procesan de forma segura y nunca se almacenan.", French: "Vos données biométriques sont traitées de manière sécurisée et ne sont jamais stockées.", German: "Ihre biometrischen Daten werden sicher verarbeitet und nie gespeichert.", Chinese: "您的生物识别数据将被安全处理，且绝不会存储在我们的服务器上。", Japanese: "生体認証データは安全に処理され、サーバーに保存されることはありません。", Hindi: "आपके बायोमेट्रिक डेटा को सुरक्षित रूप से संसाधित किया जाता है और कभी भी संग्रहीत नहीं किया जाता है।", Arabic: "تتم معالجة بياناتك الحيوية بأمان ولا يتم تخزينها أبدًا على خوادمنا.", Portuguese: "Seus dados biométricos são processados com segurança e nunca armazenados.", Russian: "Ваши биометрические данные обрабатываются безопасно и никогда не сохраняются."
  },
  "Real-time Insights": {
    English: "Real-time Insights", Spanish: "Información en tiempo real", French: "Aperçus en temps réel", German: "Echtzeit-Einblicke", Chinese: "实时洞察", Japanese: "リアルタイムのインサイト", Hindi: "वास्तविक समय की अंतर्दृष्टि", Arabic: "رؤى في الوقت الفعلي", Portuguese: "Insights em Tempo Real", Russian: "Аналитика в реальном времени"
  },
  "Get instant feedback on hydration, stress, and vitality markers.": {
    English: "Get instant feedback on hydration, stress, and vitality markers.", Spanish: "Obtén comentarios instantáneos sobre hidratación, estrés y vitalidad.", French: "Obtenez des commentaires instantanés sur l'hydratation et le stress.", German: "Erhalten Sie sofortiges Feedback zu Hydratation, Stress und Vitalität.", Chinese: "获取有关水分、压力和活力指标的即时反馈。", Japanese: "水分補給、ストレス、活力マーカーに関する即時フィードバックを取得します。", Hindi: "हाइड्रेशन, तनाव और जीवन शक्ति मार्करों पर तत्काल प्रतिक्रिया प्राप्त करें।", Arabic: "احصل على ملاحظات فورية حول علامات الترطيب والتوتر والحيوية.", Portuguese: "Obtenha feedback instantâneo sobre hidratação, estresse e vitalidade.", Russian: "Получайте мгновенную обратную связь о гидратации, стрессе и жизненном тонусе."
  },
  "AI Wellness": {
    English: "AI Wellness", Spanish: "Bienestar con IA", French: "Bien-être IA", German: "KI-Wellness", Chinese: "AI健康", Japanese: "AIウェルネス", Hindi: "एआई वेलनेस", Arabic: "عافية الذكاء الاصطناعي", Portuguese: "Bem-estar com IA", Russian: "ИИ-Велнес"
  },
  "Personalized recommendations powered by advanced machine learning.": {
    English: "Personalized recommendations powered by advanced machine learning.", Spanish: "Recomendaciones personalizadas impulsadas por aprendizaje automático.", French: "Recommandations personnalisées alimentées par l'apprentissage automatique.", German: "Personalisierte Empfehlungen durch fortschrittliches maschinelles Lernen.", Chinese: "由高级机器学习驱动的个性化建议。", Japanese: "高度な機械学習によるパーソナライズされた推奨事項。", Hindi: "उन्नत मशीन लर्निंग द्वारा संचालित व्यक्तिगत सिफारिशें।", Arabic: "توصيات مخصصة مدعومة بالتعلم الآلي المتقدم.", Portuguese: "Recomendações personalizadas por aprendizado de máquina avançado.", Russian: "Персональные рекомендации на основе передового машинного обучения."
  },
  "Cancel Scan": {
    English: "Cancel Scan", Spanish: "Cancelar escaneo", French: "Annuler le scan", German: "Scan abbrechen", Chinese: "取消扫描", Japanese: "スキャンをキャンセル", Hindi: "स्कैन रद्द करें", Arabic: "إلغاء الفحص", Portuguese: "Cancelar Scan", Russian: "Отменить"
  },
  "Analysis Failed": {
    English: "Analysis Failed", Spanish: "Análisis fallido", French: "Échec de l'analyse", German: "Analyse fehlgeschlagen", Chinese: "分析失败", Japanese: "分析に失敗しました", Hindi: "विश्लेषण विफल", Arabic: "فشل التحليل", Portuguese: "Falha na Análise", Russian: "Ошибка анализа"
  },
  "Try Again": {
    English: "Try Again", Spanish: "Intentar de nuevo", French: "Réessayer", German: "Erneut versuchen", Chinese: "重试", Japanese: "もう一度お試しください", Hindi: "पुनः प्रयास करें", Arabic: "حاول مرة أخرى", Portuguese: "Tentar Novamente", Russian: "Попробовать снова"
  },
  "The AI engine is currently experiencing high demand. Please wait a few moments and try again.": {
    Spanish: "El motor de IA está experimentando una alta demanda. Por favor, espere unos momentos e inténtelo de nuevo.",
    French: "Le moteur d'IA connaît actuellement une forte demande. Veuillez patienter quelques instants et réessayer.",
    Portuguese: "O motor de IA está passando por uma alta demanda. Aguarde alguns momentos e tente novamente."
  },
  "AI Analysis is temporarily unavailable. Our engineers are on it.": {
    English: "AI Analysis is temporarily unavailable. Our engineers are on it.",
    Spanish: "El análisis de IA no está disponible temporalmente. Nuestros ingenieros están en ello.",
    French: "L'analyse par IA est temporairement indisponible. Nos ingénieurs y travaillent.",
    Portuguese: "A análise de IA está temporariamente indisponível. Nossos engenheiros estão trabalhando nisso."
  },
  "LOADING AI MODELS...": {
    English: "Starting Aura...", Spanish: "Iniciando Aura...", French: "Démarrage d'Aura...", German: "Aura wird gestartet...", Chinese: "正在启动Aura...", Japanese: "Auraを起動中...", Hindi: "स्कैन शुरू हो रहा है...", Arabic: "بدء Aura...", Portuguese: "Iniciando Aura...", Russian: "Запуск Aura..."
  },
  "INITIALIZING BIOMETRIC ENGINE...": {
    English: "Getting ready...", Spanish: "Preparando...", French: "Préparation...", German: "Vorbereitung...", Chinese: "正在准备...", Japanese: "準備中...", Hindi: "तैयारी हो रही है...", Arabic: "جاري التحضير...", Portuguese: "Preparando...", Russian: "Подготовка..."
  },
  "MAPPING FACIAL MARKERS...": {
    English: "Mapping face...", Spanish: "Mapeando rostro...", French: "Cartographie du visage...", German: "Gesichtskartierung...", Chinese: "绘制面部图...", Japanese: "顔のマッピング中...", Hindi: "चेहरे का मानचित्रण...", Arabic: "رسم خرائط الوجه...", Portuguese: "Mapeando rosto...", Russian: "Картирование лица..."
  },
  "ANALYZING VITALITY STREAM...": {
    English: "Analyzing vitality...", Spanish: "Analizando vitalidad...", French: "Analyse de la vitalité...", German: "Vitalitätsanalyse...", Chinese: "分析生命力...", Japanese: "バイタリティを分析中...", Hindi: "जीवन शक्ति का विश्लेषण...", Arabic: "تحليل الحيوية...", Portuguese: "Analisando vitalidade...", Russian: "Анализ жизненных сил..."
  },
  "FINALIZING REPORT...": {
    English: "Finalizing...", Spanish: "Finalizando...", French: "Finalisation...", German: "Abschluss...", Chinese: "正在完成...", Japanese: "最終調整中...", Hindi: "अंतिम रूप दिया जा रहा है...", Arabic: "جاري اللمسات الأخيرة...", Portuguese: "Finalizando...", Russian: "Завершение..."
  },
  "DECODING BIOMETRICS": {
    English: "CHECKING YOUR GLOW", Spanish: "REVISANDO TU BRILLO", French: "VÉRIFICATION DE VOTRE ÉCLAT", German: "ÜBERPRÜFE DEIN STRAHLEN", Chinese: "检查您的气色", Japanese: "輝きをチェック中", Hindi: "आपकी चमक की जाँच कर रहा है", Arabic: "التحقق من توهجك", Portuguese: "VERIFICANDO SEU BRILHO", Russian: "ПРОВЕРКА ВАШЕГО СИЯНИЯ"
  },
  "Environment too dark": {
    English: "Environment too dark", Spanish: "Entorno demasiado oscuro", French: "Environnement trop sombre", Portuguese: "Ambiente muito escuro"
  },
  "Position face in guide": {
    English: "Position face in guide", Spanish: "Coloca la cara en la guía", French: "Positionnez le visage dans le guide", Portuguese: "Posicione o rosto no guia"
  },
  "Move closer": {
    English: "Move closer", Spanish: "Acércate más", French: "Approchez-vous", Portuguese: "Aproxime-se"
  },
  "Move back": {
    English: "Move back", Spanish: "Aléjate un poco", French: "Reculez un peu", Portuguese: "Afaste-se"
  },
  "Optimal position": {
    English: "Optimal position", Spanish: "Posición óptima", French: "Position optimale", Portuguese: "Posição ideal"
  },
  "LUMINANCE": {
    English: "LUMINANCE", Spanish: "LUMINANCIA", French: "LUMINANCE", Portuguese: "LUMINÂNCIA"
  },
  "BIOMETRIC_INTEGRITY": {
    English: "BIOMETRIC INTEGRITY", Spanish: "INTEGRIDAD BIOMÉTRICA", French: "INTÉGRITÉ BIOMÉTRIQUE", Portuguese: "INTEGRIDADE BIOMÉTRICA", German: "BIOMETRISCHE INTEGRITÄT", Chinese: "生物特征完整性", Japanese: "生体認証の完全性", Hindi: "बायोमेट्रिक अखंडता", Arabic: "النزاهة البيومترية", Russian: "БИОМЕТРИЧЕСКАЯ ЦЕЛОСТНОСТЬ"
  },
  "Camera access denied. Please check your settings.": {
    English: "Camera access denied. Please check your browser settings.",
    Spanish: "Acceso a la cámara denegado. Por favor revisa tu configuración.",
    French: "Accès à la caméra refusé. Veuillez vérifier vos paramètres.",
    German: "Kamerazugriff verweigert. Bitte überprüfen Sie Ihre Einstellungen.",
    Chinese: "无法访问相机。请检查您的浏览器设置。",
    Japanese: "カメラへのアクセスが拒否されました。ブラウザの設定を確認してください。",
    Hindi: "कैमरा एक्सेस अस्वीकृत। कृपया अपनी ब्राउज़र सेटिंग जांचें।",
    Arabic: "تم رفض الوصول إلى الكاميرا. يرجى التحقق من إعدادات المتصفح.",
    Portuguese: "Acesso à câmera negado. Verifique suas configurações.",
    Russian: "Доступ к камере запрещен. Проверьте настройки браузера."
  },
  "Camera not allowed. Please tap the camera icon in your address bar to turn it on.": {
    English: "Camera not allowed. Please tap the camera icon in your address bar to turn it on.",
    Spanish: "Cámara no permitida. Toca el icono de la cámara para activarla.",
    French: "Caméra non autorisée. Appuyez sur l'icône de la cámara pour l'activer.",
    German: "Kamera nicht erlaubt. Bitte tippen Sie auf das Kamerasymbol in Ihrer Adressleiste.",
    Chinese: "不允许使用相机。请点击地址栏中的相机图标将其开启。",
    Japanese: "カメラが許可されていません。アドレスバーのカメラアイコンをタップしてオンにしてください。",
    Hindi: "कैमरा की अनुमति नहीं है। कृपया इसे चालू करने के लिए अपने एड्रेस बार में कैमरा आइकन पर टैप करें।",
    Arabic: "الكاميرا غير مسموح بها. يرجى الضغط على أيقونة الكاميرا في شريط العنوان لتشغيلها.",
    Portuguese: "Câmera não permitida. Toque no ícone da câmera para ativá-la.",
    Russian: "Камера не разрешена. Нажмите на значок камеры в адресной строке, чтобы включить ее."
  },
  "No camera found. Please use a device with a camera.": {
    English: "No camera found. Please use a device with a camera.",
    Spanish: "No se encontró ninguna cámara. Por favor usa un dispositivo con cámara.",
    French: "Aucune caméra trouvée. Veuillez utiliser un appareil avec une caméra.",
    German: "Keine Kamera gefunden. Bitte verwenden Sie ein Gerät mit einer Kamera.",
    Chinese: "未找到相机。请使用带有相机的设备。",
    Japanese: "カメラが見つかりません。カメラ付きのデバイスを使用してください。",
    Hindi: "कोई कैमरा नहीं मिला। कृपया कैमरे वाले उपकरण का उपयोग करें।",
    Arabic: "لم يتم العثور على كاميرا. يرجى استخدام جهاز مزود بكاميرا.",
    Portuguese: "Nenhuma câmera encontrada. Use um dispositivo com câmera.",
    Russian: "Камера не найдена. Пожалуйста, используйте устройство с камерой."
  },
  "Camera is busy. Please close other apps using the camera.": {
    English: "Camera is busy. Please close other apps using the camera.",
    Spanish: "La cámara está ocupada. Cierra otras aplicaciones que la usen.",
    French: "La caméra est occupée. Veuillez fermer les autres applications utilisant la caméra.",
    German: "Kamera ist belegt. Bitte schließen Sie andere Apps, die die Kamera verwenden.",
    Chinese: "相机正忙。请关闭其他使用相机的应用。",
    Japanese: "カメラが使用中です。カメラを使用している他のアプリを閉じてください。",
    Hindi: "कैमरा व्यस्त है। कृपया कैमरे का उपयोग करने वाले अन्य ऐप्स बंद करें।",
    Arabic: "الكاميرا مشغولة. يرجى إغلاق التطبيقات الأخرى التي تستخدم الكاميرا.",
    Portuguese: "A câmera está ocupada. Feche outros aplicativos que usam a câmera.",
    Russian: "Камера занята. Пожалуйста, закройте другие приложения, использующие камеру."
  },
  "Your browser does not support camera access or you are not using a secure connection.": {
    English: "Your browser does not support camera access or you are not using a secure connection.",
    Spanish: "Tu navegador no admite el acceso a la cámara o no estás usando una conexión segura.",
    French: "Votre navigateur ne prend pas en charge l'accès à la caméra ou vous n'utilisez pas de connexion sécurisée.",
    German: "Ihr Browser unterstützt den Kamerazugriff nicht oder Sie verwenden keine sichere Verbindung.",
    Chinese: "您的浏览器不支持相机访问或您未使用安全连接。",
    Japanese: "お使いのブラウザはカメラへのアクセスをサポートしていないか、安全な接続を使用していません。",
    Hindi: "आपका ब्राउज़र कैमरा एक्सेस का समर्थन नहीं करता है या आप सुरक्षित कनेक्शन का उपयोग नहीं कर रहे हैं।",
    Arabic: "متصفحك لا يدعم الوصول إلى الكاميرا أو أنك لا تستخدم اتصالاً آمناً.",
    Portuguese: "Seu navegador não oferece suporte ao acesso à câmera ou você não está usando uma conexão segura.",
    Russian: "Ваш ब्राउзер не поддерживает доступ к камере или вы используете небезопасное соединение."
  },
  "Camera restricted in preview. Please open in a new tab or upload a photo.": {
    English: "Camera restricted in preview. Please open in a new tab or upload a photo.",
    Spanish: "Cámara restringida. Ábrela en una nueva pestaña o sube una foto.",
    French: "Caméra restreinte. Ouvrez dans un nouvel onglet ou téléchargez une photo.",
    German: "Kamera in der Vorschau eingeschränkt. In neuem Tab öffnen oder Foto hochladen.",
    Chinese: "预览中相机受限。请在新标签页中打开或上传照片。",
    Japanese: "プレビューではカメラが制限されています。新しいタブで開くか、写真をアップロードしてください。",
    Hindi: "पूर्वावलोकन में कैमरा प्रतिबंधित है। कृपया नए टैब में खोलें या फोटो अपलोड करें।",
    Arabic: "الكاميرا مقيدة في المعاينة. يرجى فتحها في علامة تبويب جديدة أو تحميل صورة.",
    Portuguese: "Câmera restrita. Abra em uma nova guia ou envie uma foto.",
    Russian: "Камера ограничена в режиме предпросмотра. Откройте в новой вкладке или загрузите фото."
  },
  "Simulate Demo Scan": {
    English: "Simulate Demo Scan", Spanish: "Simular escaneo de demostración", French: "Simuler un scan de démonstration", German: "Demo-Scan simulieren", Chinese: "模拟演示扫描", Japanese: "デモスキャンをシミュレート", Hindi: "डेमो स्कैन का अनुकरण करें", Arabic: "محاكاة مسح تجريبي", Portuguese: "Simular Scan de Demonstração", Russian: "Симулировать демонстрационное сканирование"
  },
  "Warning: Environment too dark": {
    English: "Warning: Environment too dark", Spanish: "Advertencia: Entorno demasiado oscuro", French: "Avertissement : Environnement trop sombre", German: "Warnung: Umgebung zu dunkel", Chinese: "警告：环境太暗", Japanese: "警告：環境が暗すぎます", Hindi: "चेतावनी: पर्यावरण बहुत अंधेरा है", Arabic: "تحذير: البيئة مظلمة جدًا", Portuguese: "Aviso: Ambiente muito escuro", Russian: "Предупреждение: Слишком темно"
  },
  "Lighting: Optimal for analysis": {
    English: "Lighting: Optimal for analysis", Spanish: "Iluminación: Óptima para el análisis", French: "Éclairage : Optimal pour l'analyse", German: "Beleuchtung: Optimal für die Analyse", Chinese: "照明：最适合分析", Japanese: "照明：分析に最適", Hindi: "प्रकाश व्यवस्था: विश्लेषण के लिए इष्टतम", Arabic: "الإضاءة: مثالية للتحليل", Portuguese: "Iluminação: Ideal para análise", Russian: "Освещение: Оптимально для анализа"
  },
  "Analysis Complete": {
    English: "Analysis Complete", Spanish: "Análisis completo", French: "Analyse terminée", German: "Analyse abgeschlossen", Chinese: "分析完成", Japanese: "分析完了", Hindi: "विश्लेषण पूर्ण", Arabic: "اكتمل التحليل", Portuguese: "Análise Concluída", Russian: "Анализ завершен"
  },
  "AuraScan Biometric Report": {
    English: "AuraScan Health Report", Spanish: "Informe de salud de AuraScan", French: "Rapport de santé AuraScan", German: "AuraScan Gesundheitsbericht", Chinese: "AuraScan健康报告", Japanese: "AuraScan健康レポート", Hindi: "AuraScan हेल्थ रिपोर्ट", Arabic: "تقرير AuraScan الصحي", Portuguese: "Relatório de Saúde AuraScan", Russian: "Отчет о здоровье AuraScan"
  },
  "Confidence": {
    English: "Confidence", Spanish: "Confianza", French: "Confiance", German: "Konfidenz", Chinese: "置信度", Japanese: "信頼度", Hindi: "आत्मविश्वास", Arabic: "الثقة", Portuguese: "Confiança", Russian: "Уверенность"
  },
  "Personalized Recommendations": {
    English: "Personalized Recommendations", Spanish: "Recomendaciones personalizadas", French: "Recommandations personnalisées", German: "Personalisierte Empfehlungen", Chinese: "个性化建议", Japanese: "パーソナライズされた推奨事項", Hindi: "व्यक्तिगत सिफारिशें", Arabic: "توصيات مخصصة", Portuguese: "Recomendações Personalizadas", Russian: "Персональные рекомендации"
  },
  "Action Plan": {
    English: "Action Plan", Spanish: "Plan de acción", French: "Plan d'action", German: "Aktionsplan", Chinese: "行动计划", Japanese: "アクションプラン", Hindi: "कार्य योजना", Arabic: "خطة العمل", Portuguese: "Plano de Ação", Russian: "План действий"
  },
  "DAY": {
    English: "DAY", Spanish: "DÍA", French: "JOUR", German: "TAG", Chinese: "天", Japanese: "日", Hindi: "दिन", Arabic: "يوم", Portuguese: "DIA", Russian: "ДЕНЬ"
  },
  "Medical Disclaimer": {
    English: "Medical Disclaimer", Spanish: "Aviso médico", French: "Avis médical", German: "Medizinischer Haftungsausschluss", Chinese: "医疗免责声明", Japanese: "医療免責事項", Hindi: "चिकित्सा अस्वीकरण", Arabic: "إخلاء المسؤولية الطبية", Portuguese: "Aviso Médico", Russian: "Медицинский отказ от ответственности"
  },
  "AuraScan is an AI-powered wellness tool and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.": {
    English: "AuraScan is a smart tool to help you track your wellness. It is not a doctor and cannot diagnose or treat diseases. Always talk to a real doctor for any medical concerns.",
    Spanish: "AuraScan es una herramienta de bienestar impulsada por IA y no sustituye el consejo, diagnóstico o tratamiento médico profesional. Siempre busca el consejo de tu médico u otro proveedor de salud calificado con cualquier pregunta que puedas tener sobre una condición médica.",
    French: "AuraScan est un outil de bien-être alimenté par l'IA et ne remplace pas les conseils, diagnostics ou traitements médicaux professionnels. Demandez toujours l'avis de votre médecin ou d'un autre professionnel de la santé qualifié pour toute question concernant un problème de santé.",
    German: "AuraScan ist ein KI-gestütztes Wellness-Tool und kein Ersatz für professionelle medizinische Beratung, Diagnose oder Behandlung. Suchen Sie bei Fragen zu einer Krankheit immer den Rat Ihres Arztes oder eines anderen qualifizierten Gesundheitsdienstleisters.",
    Chinese: "AuraScan是一款由AI驱动的健康工具，不能替代专业的医疗建议、诊断或治疗。如果您对医疗状况有任何疑问，请务必寻求您的医生或其他合格的医疗服务提供者的建议。",
    Japanese: "AuraScanはAIを活用したウェルネスツールであり、専門的な医学的アドバイス、診断、または治療に代わるものではありません。病状に関する質問がある場合は、常に医師または他の資格のある医療提供者のアドバイスを求めてください。",
    Hindi: "AuraScan एक AI-संचालित वेलनेस टूल है और यह पेशेवर चिकित्सा सलाह, निदान या उपचार का विकल्प नहीं है। किसी भी चिकित्सा स्थिति के संबंध में किसी भी प्रश्न के लिए हमेशा अपने चिकित्सक या अन्य योग्य स्वास्थ्य प्रदाता की सलाह लें।",
    Arabic: "AuraScan هي أداة عافية مدعومة بالذكاء الاصطناعي وليست بديلاً عن الاستشارة الطبية المتخصصة أو التشخيص أو العلاج. اطلب دائمًا نصيحة طبيبك أو غيره من مقدمي الرعاية الصحية المؤهلين بشأن أي أسئلة قد تكون لديك بخصوص حالة طبية.",
    Portuguese: "O AuraScan é uma ferramenta de bem-estar com tecnologia de IA e não substitui aconselhamento, diagnóstico ou tratamento médico profissional. Procure sempre o conselho do seu médico ou outro profissional de saúde qualificado com qualquer dúvida que possa ter sobre uma condição médica.",
    Russian: "AuraScan — это инструмент для здоровья на базе ИИ, который не заменяет профессиональную медицинскую консультацию, диагностику или лечение. Всегда обращайтесь за советом к своему врачу или другому квалифицированному медицинскому работнику по любым вопросам, касающимся состояния здоровья."
  },
  "Scan Again": {
    English: "Scan Again", Spanish: "Escanear de nuevo", French: "Scanner à nouveau", German: "Erneut scannen", Chinese: "再次扫描", Japanese: "再スキャン", Hindi: "फिर से स्कैन करें", Arabic: "مسح مرة أخرى", Portuguese: "Escanear Novamente", Russian: "Сканировать снова"
  },
  "Score": {
    English: "Score", Spanish: "Puntuación", French: "Score", German: "Punktzahl", Chinese: "分数", Japanese: "スコア", Hindi: "स्कोर", Arabic: "النتيجة", Portuguese: "Pontuação", Russian: "Оценка"
  },
  "Back to Scanner": {
    English: "Back to Scanner", Spanish: "Volver al escáner", French: "Retour au scanner", German: "Zurück zum Scanner", Chinese: "返回扫描仪", Japanese: "スキャナーに戻る", Hindi: "स्कैनर पर वापस", Arabic: "العودة إلى الماسح الضوئي", Portuguese: "Voltar ao Scanner", Russian: "Назад к сканеру"
  },
  "Scan History": {
    English: "Scan History", Spanish: "Historial de escaneo", French: "Historique des scans", German: "Scan-Verlauf", Chinese: "扫描历史", Japanese: "スキャン履歴", Hindi: "स्कैन इतिहास", Arabic: "سجل الفحص", Portuguese: "Histórico de Scans", Russian: "История сканирований"
  },
  "Loading history...": {
    English: "Loading history...", Spanish: "Cargando historial...", French: "Chargement de l'historique...", German: "Lade Verlauf...", Chinese: "正在加载历史记录...", Japanese: "履歴を読み込み中...", Hindi: "इतिहास लोड हो रहा है...", Arabic: "جاري تحميل السجل...", Portuguese: "Carregando histórico...", Russian: "Загрузка истории..."
  },
  "No scans found. Start your first health scan!": {
    English: "No scans found. Start your first health scan!", Spanish: "No se encontraron escaneos. ¡Inicia tu primer escaneo de salud!", French: "Aucun scan trouvé. Commencez votre premier scan de santé !", German: "Keine Scans gefunden. Starten Sie Ihren ersten Gesundheitsscan!", Chinese: "未找到扫描。开始您的第一次健康扫描！", Japanese: "スキャンが見つかりません。最初のヘルススキャンを開始してください！", Hindi: "कोई स्कैन नहीं मिला। अपना पहला स्वास्थ्य स्कैन शुरू करें!", Arabic: "لم يتم العثور على فحوصات. ابدأ فحصك الصحي الأول!", Portuguese: "Nenhum scan encontrado. Inicie seu primeiro scan de saúde!", Russian: "Сканирования не найдены. Начните свое первое сканирование здоровья!"
  },
  "Recent": {
    English: "Recent", Spanish: "Reciente", French: "Récent", German: "Kürzlich", Chinese: "最近", Japanese: "最近", Hindi: "हाल का", Arabic: "الأخيرة", Portuguese: "Recente", Russian: "Недавние"
  },
  "Wellness Trends": {
    English: "Wellness Trends", Spanish: "Tendencias de bienestar", French: "Tendances bien-être", German: "Wellness-Trends", Chinese: "健康趋势", Japanese: "ウェルネストレンド", Hindi: "कल्याण रुझान", Arabic: "اتجاهات العافية", Portuguese: "Tendências de Bem-Estar", Russian: "Тенденции здоровья"
  },
  "Score progression over time": {
    English: "Score progression over time", Spanish: "Progresión de la puntuación a lo largo del tiempo", French: "Progression du score dans le temps", German: "Punkteentwicklung im Laufe der Zeit", Chinese: "随时间推移的分数进展", Japanese: "時間の経過に伴うスコアの推移", Hindi: "समय के साथ स्कोर की प्रगति", Arabic: "تطور النتيجة بمرور الوقت", Portuguese: "Progressão da pontuação ao longo do tempo", Russian: "Динамика оценки с течением времени"
  },
  "Average Score": {
    English: "Average Score", Spanish: "Puntuación media", French: "Score moyen", German: "Durchschnittliche Punktzahl", Chinese: "平均分", Japanese: "平均スコア", Hindi: "औसत स्कोर", Arabic: "متوسط النتيجة", Portuguese: "Pontuação Média", Russian: "Средний балл"
  },
  "Forehead": {
    English: "Forehead", Spanish: "Frente", French: "Front", German: "Stirn", Chinese: "额头", Japanese: "額", Hindi: "माथा", Arabic: "الجبهة", Portuguese: "Testa", Russian: "Лоб"
  },
  "Eyes": {
    English: "Eyes", Spanish: "Ojos", French: "Yeux", German: "Augen", Chinese: "眼睛", Japanese: "目", Hindi: "आंखें", Arabic: "العيون", Portuguese: "Olhos", Russian: "Глаза"
  },
  "Nose": {
    English: "Nose", Spanish: "Nariz", French: "Nez", German: "Nase", Chinese: "鼻子", Japanese: "鼻", Hindi: "नाक", Arabic: "الأنف", Portuguese: "Nariz", Russian: "Нос"
  },
  "Cheeks": {
    English: "Cheeks", Spanish: "Mejillas", French: "Joues", German: "Wangen", Chinese: "脸颊", Japanese: "頬", Hindi: "गाल", Arabic: "الخدين", Portuguese: "Bochechas", Russian: "Щеки"
  },
  "Mouth": {
    English: "Mouth", Spanish: "Boca", French: "Bouche", German: "Mund", Chinese: "嘴巴", Japanese: "口", Hindi: "मुंह", Arabic: "الفم", Portuguese: "Boca", Russian: "Рот"
  },
  "Jawline": {
    English: "Jawline", Spanish: "Mandíbula", French: "Mâchoire", German: "Kieferpartie", Chinese: "下颌线", Japanese: "顎のライン", Hindi: "जबड़े की रेखा", Arabic: "خط الفك", Portuguese: "Mandíbula", Russian: "Линия подбородка"
  },
  "optimal": {
    English: "Excellent", Spanish: "Excelente", French: "Excellent", German: "Ausgezeichnet", Chinese: "极好", Japanese: "優秀", Hindi: "उत्कृष्ट", Arabic: "ممتاز", Portuguese: "Excelente", Russian: "Отлично"
  },
  "fair": {
    English: "Good", Spanish: "Bueno", French: "Bon", German: "Gut", Chinese: "好", Japanese: "良い", Hindi: "अच्छा", Arabic: "جيد", Portuguese: "Bom", Russian: "Хорошо"
  },
  "attention needed": {
    English: "Needs Care", Spanish: "Necesita cuidado", French: "Besoin de soins", German: "Pflege erforderlich", Chinese: "需要关注", Japanese: "ケアが必要", Hindi: "देखभाल की ज़रूरत है", Arabic: "بحاجة للرعاية", Portuguese: "Precisa de Cuidado", Russian: "Требуется внимание"
  },
  "Login failed. Please ensure your domain is added to Firebase Authorized Domains.": {
    English: "Login failed. Please ensure your domain is added to Firebase Authorized Domains.",
    Spanish: "Error de inicio de sesión. Asegúrate de que tu dominio esté agregado a los dominios autorizados de Firebase.",
    French: "Échec de la connexion. Veuillez vous assurer que votre domaine est ajouté aux domaines autorisés de Firebase.",
    German: "Anmeldung fehlgeschlagen. Bitte stellen Sie sicher, dass Ihre Domain zu den autorisierten Firebase-Domains hinzugefügt wurde.",
    Chinese: "登录失败。请确保您的域已添加到Firebase授权域中。",
    Japanese: "ログインに失敗しました。ドメインがFirebaseの承認済みドメインに追加されていることを確認してください。",
    Hindi: "लॉगिन विफल। कृपया सुनिश्चित करें कि आपका डोमेन फायरबेस अधिकृत डोमेन में जोड़ा गया है।",
    Arabic: "فشل تسجيل الدخول. يرجى التأكد من إضافة نطاقك إلى نطاقات Firebase المعتمدة.",
    Portuguese: "Falha no login. Certifique-se de que seu domínio foi adicionado aos Domínios Autorizados do Firebase.",
    Russian: "Ошибка входа. Убедитесь, что ваш домен добавлен в авторизованные домены Firebase."
  },
  "Analysis failed. Please try again.": {
    English: "Analysis failed. Please try again.",
    Spanish: "El análisis falló. Por favor, inténtalo de nuevo.",
    French: "L'analyse a échoué. Veuillez réessayer.",
    German: "Analyse fehlgeschlagen. Bitte versuchen Sie es erneut.",
    Chinese: "分析失败。请重试。",
    Japanese: "分析に失敗しました。もう一度お試しください。",
    Hindi: "विश्लेषण विफल रहा। कृपया पुनः प्रयास करें।",
    Arabic: "فشل التحليل. يرجى المحاولة مرة أخرى.",
    Portuguese: "A análise falhou. Por favor, tente novamente.",
    Russian: "Анализ не удался. Пожалуйста, попробуйте еще раз."
  },
  "© 2026 AuraScan Biometrics • For Informational Purposes Only": {
    English: "© 2026 AuraScan Biometrics • For Informational Purposes Only",
    Spanish: "© 2026 AuraScan Biometrics • Solo con fines informativos",
    French: "© 2026 AuraScan Biometrics • À des fins d'information uniquement",
    German: "© 2026 AuraScan Biometrics • Nur zu Informationszwecken",
    Chinese: "© 2026 AuraScan Biometrics • 仅供参考",
    Japanese: "© 2026 AuraScan Biometrics • 情報提供のみを目的としています",
    Hindi: "© 2026 AuraScan Biometrics • केवल सूचना के उद्देश्यों के लिए",
    Arabic: "© 2026 AuraScan Biometrics • للأغراض الإعلامية فقط",
    Portuguese: "© 2026 AuraScan Biometrics • Apenas para fins informativos",
    Russian: "© 2026 AuraScan Biometrics • Только для информационных целей"
  },
  "Feedback": {
    English: "Feedback", Spanish: "Comentarios", French: "Commentaires", German: "Feedback", Chinese: "反馈", Japanese: "フィードバック", Hindi: "प्रतिक्रिया", Arabic: "التعليقات", Portuguese: "Feedback", Russian: "Обратная связь"
  },
  "Help us improve AuraScan": {
    English: "Help us improve AuraScan", Spanish: "Ayúdanos a mejorar AuraScan", French: "Aidez-nous à améliorer AuraScan", German: "Helfen Sie uns, AuraScan zu verbessern", Chinese: "帮助我们改进AuraScan", Japanese: "AuraScanの改善にご協力ください", Hindi: "AuraScan को बेहतर बनाने में हमारी मदद करें", Arabic: "ساعدنا في تحسين AuraScan", Portuguese: "Ajude-nos a melhorar o AuraScan", Russian: "Помогите нам улучшить AuraScan"
  },
  "Your feedback": {
    English: "Your feedback", Spanish: "Tus comentarios", French: "Vos commentaires", German: "Ihr Feedback", Chinese: "您的反馈", Japanese: "あなたのフィードバック", Hindi: "आपकी प्रतिक्रिया", Arabic: "رأيك", Portuguese: "Seu feedback", Russian: "Ваш отзыв"
  },
  "Tell us what you think or report an issue...": {
    English: "Tell us what you think or report an issue...", Spanish: "Cuéntanos qué piensas o informa un problema...", French: "Dites-nous ce que vous en pensez ou signalez un problème...", German: "Sagen Sie uns Ihre Meinung oder melden Sie ein Problem...", Chinese: "告诉我们您的想法或报告问题...", Japanese: "ご意見をお聞かせいただくか、問題を報告してください...", Hindi: "हमें बताएं कि आप क्या सोचते हैं या किसी समस्या की रिपोर्ट करें...", Arabic: "أخبرنا برأيك أو أبلغ عن مشكلة...", Portuguese: "Diga-nos o que você acha ou relate um problema...", Russian: "Расскажите нам, что вы думаете, или сообщите о проблеме..."
  },
  "Submit Feedback": {
    English: "Submit Feedback", Spanish: "Enviar comentarios", French: "Envoyer les commentaires", German: "Feedback absenden", Chinese: "提交反馈", Japanese: "フィードバックを送信", Hindi: "प्रतिक्रिया सबमिट करें", Arabic: "إرسال التعليقات", Portuguese: "Enviar Feedback", Russian: "Отправить отзыв"
  },
  "Cancel": {
    English: "Cancel", Spanish: "Cancelar", French: "Annuler", German: "Abbrechen", Chinese: "取消", Japanese: "キャンセル", Hindi: "रद्द करें", Arabic: "إلغاء", Portuguese: "Cancelar", Russian: "Отмена"
  },
  "Thank you for your feedback!": {
    English: "Thank you for your feedback!", Spanish: "¡Gracias por tus comentarios!", French: "Merci pour vos commentaires !", German: "Vielen Dank für Ihr Feedback!", Chinese: "感谢您的反馈！", Japanese: "フィードバックをありがとうございました！", Hindi: "आपकी प्रतिक्रिया के लिए धन्यवाद!", Arabic: "شكرا لك على ملاحظاتك!", Portuguese: "Obrigado pelo seu feedback!", Russian: "Спасибо за ваш отзыв!"
  },
  "Select Focus Area": {
    English: "Select Focus Area", Spanish: "Seleccionar área de enfoque", French: "Sélectionner la zone de concentration", German: "Fokusbereich auswählen", Chinese: "选择重点区域", Japanese: "重点領域を選択", Hindi: "फोकस क्षेत्र चुनें", Arabic: "حدد منطقة التركيز", Portuguese: "Selecionar Área de Foco", Russian: "Выберите область внимания"
  },
  "General Wellness": {
    English: "General Wellness", Spanish: "Bienestar general", French: "Bien-être général", German: "Allgemeines Wohlbefinden", Chinese: "一般健康", Japanese: "一般的なウェルネス", Hindi: "सामान्य कल्याण", Arabic: "العافية العامة", Portuguese: "Bem-estar Geral", Russian: "Общее самочувствие"
  },
  "Skin & Aging": {
    English: "Skin & Aging", Spanish: "Piel y envejecimiento", French: "Peau et vieillissement", German: "Haut & Alterung", Chinese: "皮肤与抗衰老", Japanese: "肌とエイジング", Hindi: "त्वचा और उम्र बढ़ना", Arabic: "البشرة والشيخوخة", Portuguese: "Pele e Envelhecimento", Russian: "Кожа и старение"
  },
  "Cardiovascular Health": {
    English: "Cardiovascular Health", Spanish: "Salud cardiovascular", French: "Santé cardiovasculaire", German: "Herz-Kreislauf-Gesundheit", Chinese: "心血管健康", Japanese: "心血管の健康", Hindi: "हृदय स्वास्थ्य", Arabic: "صحة القلب والأوعية الدموية", Portuguese: "Saúde Cardiovascular", Russian: "Сердечно-сосудистое здоровье"
  },
  "Stress & Fatigue": {
    English: "Stress & Fatigue", Spanish: "Estrés y fatiga", French: "Stress et fatigue", German: "Stress & Müdigkeit", Chinese: "压力与疲劳", Japanese: "ストレスと疲労", Hindi: "तनाव और थकान", Arabic: "التوتر والإرهاق", Portuguese: "Estresse e Fadiga", Russian: "Стресс и усталость"
  },
  "Digestive Health": {
    English: "Digestive Health", Spanish: "Salud digestiva", French: "Santé digestive", German: "Verdauungsgesundheit", Chinese: "消化健康", Japanese: "消化器系の健康", Hindi: "पाचन स्वास्थ्य", Arabic: "صحة الجهاز الهضمي", Portuguese: "Saúde Digestiva", Russian: "Пищеварительное здоровье"
  },
  "Immune System": {
    English: "Immune System", Spanish: "Sistema inmunológico", French: "Système immunitaire", German: "Immunsystem", Chinese: "免疫系统", Japanese: "免疫システム", Hindi: "प्रतिरक्षा प्रणाली", Arabic: "جهاز المناعة", Portuguese: "Sistema Imunológico", Russian: "Иммунная система"
  },
  "Upload Photo Instead": {
    English: "Upload Photo Instead", Spanish: "Subir foto en su lugar", French: "Télécharger une photo à la place", German: "Stattdessen Foto hochladen", Chinese: "改为上传照片", Japanese: "代わりに写真をアップロード", Hindi: "इसके बजाय फ़ोटो अपलोड करें", Arabic: "تحميل صورة بدلاً من ذلك", Portuguese: "Enviar foto em vez disso", Russian: "Загрузить фото вместо этого"
  },
  "Progress": {
    English: "Progress", Spanish: "Progreso", French: "Progrès", German: "Fortschritt", Chinese: "进度", Japanese: "進捗", Hindi: "प्रगति", Arabic: "التقدم", Portuguese: "Progresso", Russian: "Прогресс"
  },
  "Please ensure this domain is added to Firebase Authorized Domains:": {
    English: "Please ensure this domain is added to Firebase Authorized Domains:", Spanish: "Asegúrese de que este dominio esté agregado a los dominios autorizados de Firebase:", French: "Veuillez vous assurer que ce domaine est ajouté aux domaines autorisés Firebase :", German: "Bitte stellen Sie sicher, dass diese Domain zu den autorisierten Firebase-Domains hinzugefügt wurde:", Chinese: "请确保此域名已添加到 Firebase 授权域名中：", Japanese: "このドメインが Firebase の承認済みドメインに追加されていることを確認してください:", Hindi: "कृपया सुनिश्चित करें कि यह डोमेन Firebase अधिकृत डोमेन में जोड़ा गया है:", Arabic: "يرجى التأكد من إضافة هذا النطاق إلى نطاقات Firebase المعتمدة:", Portuguese: "Certifique-se de que este domínio foi adicionado aos Domínios Autorizados do Firebase:", Russian: "Убедитесь, что этот домен добавлен в список разрешенных доменов Firebase:"
  },
  "Admin": {
    English: "Admin", Spanish: "Administrador", French: "Admin", German: "Admin", Chinese: "管理员", Japanese: "管理者", Hindi: "व्यवस्थापक", Arabic: "المشرف", Portuguese: "Admin", Russian: "Админ"
  },
  "Admin Control Panel": {
    English: "Admin Control Panel", Spanish: "Panel de control del administrador", French: "Panneau de configuration de l'administrateur", German: "Admin-Kontrollzentrum", Chinese: "管理员控制面板", Japanese: "管理者コントロールパネル", Hindi: "व्यवस्थापक नियंत्रण कक्ष", Arabic: "لوحة تحكم المشرف", Portuguese: "Painel de Controle do Administrador", Russian: "Панель управления администратора"
  },
  "Total Scans": {
    English: "Total Scans", Spanish: "Escaneos totales", French: "Total des scans", German: "Gesamtscans", Chinese: "总扫描次数", Japanese: "総スキャン数", Hindi: "कुल स्कैन", Arabic: "إجمالي عمليات المسح", Portuguese: "Total de Scans", Russian: "Всего сканирований"
  },
  "API & System": {
    English: "API & System", Spanish: "API y sistema", French: "API et système", German: "API & System", Chinese: "API与系统", Japanese: "APIとシステム", Hindi: "एपीआई और सिस्टम", Arabic: "واجهة برمجة التطبيقات والنظام", Portuguese: "API e Sistema", Russian: "API и система"
  },
  "Gemini AI API Status": {
    English: "Gemini AI API Status", Spanish: "Estado de la API de Gemini AI", French: "Statut de l'API Gemini AI", German: "Gemini AI API Status", Chinese: "Gemini AI API状态", Japanese: "Gemini AI APIステータス", Hindi: "जेमिनी एआई एपीआई स्थिति", Arabic: "حالة واجهة برمجة تطبيقات Gemini AI", Portuguese: "Status da API Gemini AI", Russian: "Статус Gemini AI API"
  },
  "API Configuration": {
    English: "API Configuration", Spanish: "Configuración de API", French: "Configuration de l'API", German: "API-Konfiguration", Chinese: "API配置", Japanese: "API設定", Hindi: "एपीआई कॉन्फ़िगरेशन", Arabic: "تكوين واجهة برمجة التطبيقات", Portuguese: "Configuração da API", Russian: "Конфигурация API"
  },
  "Active & Connected": {
    English: "Active & Connected", Spanish: "Activo y conectado", French: "Actif et connecté", German: "Aktiv & Verbunden", Chinese: "已激活并连接", Japanese: "アクティブで接続済み", Hindi: "सक्रिय और जुड़ा हुआ", Arabic: "نشط ومتصل", Portuguese: "Ativo e Conectado", Russian: "Активен и подключен"
  },
  "Current Model": {
    English: "Current Model", Spanish: "Modelo actual", French: "Modèle actuel", German: "Aktuelles Modell", Chinese: "当前模型", Japanese: "現在のモデル", Hindi: "वर्तमान मॉडल", Arabic: "النموذج الحالي", Portuguese: "Modelo Atual", Russian: "Текущая модель"
  },
  "Estimated Balance": {
    English: "Estimated Balance", Spanish: "Saldo estimado", French: "Solde estimé", German: "Geschätztes Guthaben", Chinese: "预估余额", Japanese: "推定残高", Hindi: "अनुमानित शेष", Arabic: "الرصيد التقديري", Portuguese: "Saldo Estimado", Russian: "Оценочный баланс"
  },
  "UNLIMITED PREVIEW": {
    English: "UNLIMITED PREVIEW", Spanish: "VISTA PREVIA ILIMITADA", French: "APERÇU ILLIMITÉ", German: "UNBEGRENZTE VORSCHAU", Chinese: "无限预览", Japanese: "無制限プレビュー", Hindi: "असीमित पूर्वावलोकन", Arabic: "معاينة غير محدودة", Portuguese: "PRÉ-VISUALIZAÇÃO ILIMITADA", Russian: "НЕОГРАНИЧЕННЫЙ ПРОСМОТР"
  },
  "Usage Insights": {
    English: "Usage Insights", Spanish: "Información de uso", French: "Aperçu de l'utilisation", German: "Nutzungseinblicke", Chinese: "使用洞察", Japanese: "使用状況のインサイト", Hindi: "उपयोग अंतर्दृष्टि", Arabic: "رؤى الاستخدام", Portuguese: "Insights de Uso", Russian: "Аналитика использования"
  },
  "Avg. Cost per Scan": {
    English: "Avg. Cost per Scan", Spanish: "Costo promedio por escaneo", French: "Coût moyen por scan", German: "Durchschn. Kosten pro Scan", Chinese: "每次扫描平均成本", Japanese: "スキャンあたりの平均コスト", Hindi: "प्रति स्कैन औसत लागत", Arabic: "متوسط التكلفة لكل مسح", Portuguese: "Custo Médio por Scan", Russian: "Средняя стоимость сканирования"
  },
  "Total Estimated Cost": {
    English: "Total Estimated Cost", Spanish: "Costo total estimado", French: "Coût total estimé", German: "Geschätzte Gesamtkosten", Chinese: "总预估成本", Japanese: "推定総コスト", Hindi: "कुल अनुमानित लागत", Arabic: "إجمالي التكلفة التقديرية", Portuguese: "Custo Total Estimado", Russian: "Общая оценочная стоимость"
  },
  "Quota Reset": {
    English: "Quota Reset", Spanish: "Restablecimiento de cuota", French: "Réinitialisation du quota", German: "Kontingent-Reset", Chinese: "配额重置", Japanese: "クォータのリセット", Hindi: "कोटा रीसेट", Arabic: "إعادة تعيين الحصة", Portuguese: "Redefinição de Cota", Russian: "Сброс квоты"
  },
  "Note: Costs are estimated based on Gemini Flash pricing. Actual billing is handled via your Google Cloud Console.": {
    English: "Note: Costs are estimated based on Gemini Flash pricing. Actual billing is handled via your Google Cloud Console.",
    Spanish: "Nota: Los costos se estiman según los precios de Gemini Flash. La facturación real se gestiona a través de Google Cloud Console.",
    French: "Note : Les coûts sont estimés sur la base des tarifs de Gemini Flash. La facturación real se gestiona a través de Google Cloud Console.",
    German: "Hinweis: Die Kosten werden basierend auf den Gemini Flash-Preisen geschätzt. Die tatsächliche Abrechnung erfolgt über Ihre Google Cloud Console.",
    Chinese: "注：成本是根据 Gemini Flash 定价估算的。实际账单通过您的 Google Cloud 控制台处理。",
    Japanese: "注：コストは Gemini Flash の価格に基づいて推定されています。実際の請求は Google Cloud コンソールで処理されます。",
    Hindi: "नोट: लागत जेमिनी फ्लैश मूल्य निर्धारण के आधार पर अनुमानित है। वास्तविक बिलिंग आपके Google क्लाउड कंसोल के माध्यम से नियंत्रित की जाती है।",
    Arabic: "ملاحظة: يتم تقدير التكاليف بناءً على تسعير Gemini Flash. يتم التعامل مع الفواتير الفعلية عبر Google Cloud Console.",
    Portuguese: "Nota: Os custos são estimados com base nos preços do Gemini Flash. O faturamento real é gerenciado pelo Google Cloud Console.",
    Russian: "Примечание: Расходы оцениваются на основе цен Gemini Flash. Фактическое выставление счетов осуществляется через Google Cloud Console."
  },
  "External Client Access": {
    English: "External Client Access", Spanish: "Acceso de cliente externo", French: "Accès client externe", German: "Externer Client-Zugriff", Chinese: "外部客户端访问", Japanese: "外部クライアントアクセス", Hindi: "बाहरी क्लाइंट एक्सेस", Arabic: "وصول العميل الخارجي", Portuguese: "Acesso de Cliente Externo", Russian: "Доступ внешнего клиента"
  },
  "Your API is currently configured to allow requests from authorized clients. To allow other applications to use your Gemini key, they should connect via your backend proxy endpoint:": {
    English: "Your API is currently configured to allow requests from authorized clients. To allow other applications to use your Gemini key, they should connect via your backend proxy endpoint:",
    Spanish: "Su API está configurada actualmente para permitir solicitudes de clientes autorizados. Para permitir que otras aplicaciones usen su clave Gemini, deben conectarse a través de su punto final de proxy de backend:",
    French: "Votre API est actuellement configurée pour autoriser les requêtes de clients autorisés. Pour permettre à d'autres applications d'utiliser votre clé Gemini, elles doivent se connecter via votre point de terminaison proxy backend :",
    German: "Ihre API ist derzeit so konfiguriert, dass Anfragen von autorisierten Clients zulässig sind. Damit andere Anwendungen Ihren Gemini-Schlüssel verwenden können, sollten sie über Ihren Backend-Proxy-Endpunkt eine Verbindung herstellen:",
    Chinese: "您的 API 目前配置为允许来自授权客户端的请求。要允许其他应用程序使用您的 Gemini 密钥，它们应通过您的后端代理端点连接：",
    Japanese: "API は現在、承認されたクライアントからのリクエストを許可するように構成されています。他のアプリケーションが Gemini キーを使用できるようにするには、バックエンド プロキシ エンドポイント経由で接続する必要があります。",
    Hindi: "आपका एपीआई वर्तमान में अधिकृत क्लाइंट से अनुरोधों की अनुमति देने के लिए कॉन्फ़िगर किया गया है। अन्य अनुप्रयोगों को आपकी जेमिनी कुंजी का उपयोग करने की अनुमति देने के लिए, उन्हें आपके बैकएंड प्रॉक्सी एंडपॉइंट के माध्यम से जुड़ना चाहिए:",
    Arabic: "تم تكوين واجهة برمجة التطبيقات الخاصة بك حاليًا للسماح بالطلبات من العملاء المصرح لهم. للسماح للتطبيقات الأخرى باستخدام مفتاح Gemini الخاص بك ، يجب عليهم الاتصال عبر نقطة نهاية وكيل الواجهة الخلفية:",
    Portuguese: "Sua API está configurada atualmente para permitir solicitações de clientes autorizados. Para permitir que outros aplicativos usem sua chave Gemini, eles devem se conectar por meio do seu endpoint de proxy de back-end:",
    Russian: "Ваш API в настоящее время настроен на разрешение запросов от авторизованных клиентов. Чтобы разрешить другим приложениям использовать ваш ключ Gemini, они должны подключаться через вашу прокси-точку бэкенда:"
  },
  "Security Warning: Ensure you implement proper authentication (JWT/API Keys) if exposing this endpoint publicly.": {
    English: "Security Warning: Ensure you implement proper authentication (JWT/API Keys) if exposing this endpoint publicly.",
    Spanish: "Advertencia de seguridad: asegúrese de implementar la autenticación adecuada (JWT/claves API) si expone este punto final públicamente.",
    French: "Avertissement de sécurité : assurez-vous d'implémenter une autenticación adecuada (JWT/clés API) si vous exposez ce point de terminaison publiquement.",
    German: "Sicherheitshinweis: Stellen Sie sicher, dass Sie eine ordnungsgemäße Authentifizierung (JWT/API-Schlüssel) implementieren, wenn Sie diesen Endpunkt öffentlich verfügbar machen.",
    Chinese: "安全警告：如果公开此端点，请确保实施适当的身份验证（JWT/API 密钥）。",
    Japanese: "セキュリティ警告: このエンドポイントを公開する場合は、適切な認証 (JWT/API キー) を実装してください。",
    Hindi: "सुरक्षा चेतावनी: यदि इस एंडपॉइंट को सार्वजनिक रूप से प्रदर्शित किया जा रहा है, तो सुनिश्चित करें कि आप उचित प्रमाणीकरण (JWT/API कुंजियाँ) लागू करते हैं।",
    Arabic: "تحذير أمني: تأكد من تنفيذ المصادقة المناسبة (JWT / مفاتيح API) إذا كنت تعرض نقطة النهاية هذه علنًا.",
    Portuguese: "Aviso de Segurança: Certifique-se de implementar a autenticação adequada (JWT/Chaves de API) se expuser este endpoint publicamente.",
    Russian: "Предупреждение о безопасности: убедитесь, что вы внедрили надлежащую аутентификацию (JWT/API-ключи), если выставляете эту конечную точку публично."
  },
  "Total Feedback": {
    English: "Total Feedback", Spanish: "Comentarios totales", French: "Commentaires totaux", German: "Gesamtes Feedback", Chinese: "总反馈", Japanese: "総フィードバック", Hindi: "कुल प्रतिक्रिया", Arabic: "إجمالي الملاحظات", Portuguese: "Total de Feedback", Russian: "Всего отзывов"
  },
  "Recent Users": {
    English: "Recent Users", Spanish: "Usuarios recientes", French: "Utilisateurs récents", German: "Kürzliche Benutzer", Chinese: "最近用户", Japanese: "最近のユーザー", Hindi: "हाल के उपयोगकर्ता", Arabic: "المستخدمون الجدد", Portuguese: "Usuários Recentes", Russian: "Недавние пользователи"
  },
  "User Feedback": {
    English: "User Feedback", Spanish: "Comentarios de los usuarios", French: "Commentaires des utilisateurs", German: "Benutzer-Feedback", Chinese: "用户反馈", Japanese: "ユーザーフィードバック", Hindi: "उपयोगकर्ता प्रतिक्रिया", Arabic: "ملاحظات المستخدم", Portuguese: "Feedback do Usuário", Russian: "Отзывы пользователей"
  },
  "Loading admin data...": {
    English: "Loading admin data...", Spanish: "Cargando datos del administrador...", French: "Chargement des données de l'administrateur...", German: "Admin-Daten werden geladen...", Chinese: "正在加载管理员数据...", Japanese: "管理者データを読み込んでいます...", Hindi: "व्यवस्थापक डेटा लोड हो रहा है...", Arabic: "جاري تحميل بيانات المشرف...", Portuguese: "Carregando dados do administrador...", Russian: "Загрузка данных администратора..."
  },
  "No feedback received yet.": {
    English: "No feedback received yet.", Spanish: "Aún no se han recibido comentarios.", French: "Aucun commentaire reçu pour le moment.", German: "Noch kein Feedback erhalten.", Chinese: "尚未收到反馈。", Japanese: "まだフィードバックを受け取っていません。", Hindi: "अभी तक कोई प्रतिक्रिया नहीं मिली है।", Arabic: "لم يتم تلقي أي ملاحظات بعد.", Portuguese: "Nenhum feedback recebido ainda.", Russian: "Отзывов пока нет."
  },
  "No users found.": {
    English: "No users found.", Spanish: "No se encontraron usuarios.", French: "Aucun utilisateur trouvé.", German: "Keine Benutzer gefunden.", Chinese: "未找到用户。", Japanese: "ユーザーが見つかりません。", Hindi: "कोई उपयोगकर्ता नहीं मिला।", Arabic: "لم يتم العثور على مستخدمين.", Portuguese: "Nenhum usuário encontrado.", Russian: "Пользователи не найдены."
  },
  "Email": {
    English: "Email", Spanish: "Correo electrónico", French: "E-mail", German: "E-Mail", Chinese: "电子邮件", Japanese: "Eメール", Hindi: "ईमेल", Arabic: "البريد الإلكتروني", Portuguese: "E-mail", Russian: "Электронная почта"
  },
  "Joined": {
    English: "Joined", Spanish: "Unido", French: "Inscrit", German: "Beigetreten", Chinese: "加入", Japanese: "参加しました", Hindi: "शामिल हुए", Arabic: "انضم", Portuguese: "Entrou", Russian: "Присоединился"
  },
  "User ID": {
    English: "User ID", Spanish: "ID de usuario", French: "ID utilisateur", German: "Benutzer-ID", Chinese: "用户 ID", Japanese: "ユーザー ID", Hindi: "उपयोगकर्ता आईडी", Arabic: "معرف المستخدم", Portuguese: "ID do Usuário", Russian: "ID пользователя"
  },
  "Back to Dashboard": {
    English: "Back to Dashboard", Spanish: "Volver al panel", French: "Retour au tableau de bord", German: "Zurück zum Dashboard", Chinese: "返回仪表板", Japanese: "ダッシュボードに戻る", Hindi: "डैशबोर्ड पर वापस जाएं", Arabic: "العودة إلى لوحة القيادة", Portuguese: "Voltar ao Painel", Russian: "Вернуться на панель управления"
  },
  "Upgrade to Pro": {
    English: "Upgrade to Pro", Spanish: "Actualizar a Pro", French: "Passer à la version Pro", German: "Auf Pro upgraden", Chinese: "升级到 Pro", Japanese: "Pro にアップグレード", Hindi: "प्रो में अपग्रेड करें", Arabic: "الترقية إلى برو", Portuguese: "Atualizar para Pro", Russian: "Обновить до Pro"
  },
  "Welcome to AuraScan Pro!": {
    English: "Welcome to AuraScan Pro!", Spanish: "¡Bienvenido a AuraScan Pro!", French: "Bienvenue sur AuraScan Pro !", German: "Willkommen bei AuraScan Pro!", Chinese: "欢迎使用 AuraScan Pro！", Japanese: "AuraScan Pro へようこそ！", Hindi: "AuraScan Pro में आपका स्वागत है!", Arabic: "مرحبًا بك في AuraScan Pro!", Portuguese: "Bem-vindo ao AuraScan Pro!", Russian: "Добро пожаловать в AuraScan Pro!"
  },
  "Recommended for You": {
    English: "Recommended for You", Spanish: "Recomendado para ti", French: "Recommandé pour vous", German: "Für Sie empfohlen", Chinese: "为你推荐", Japanese: "あなたへのおすすめ", Hindi: "आपके लिए अनुशंसित", Arabic: "موصى به لك", Portuguese: "Recomendado para Você", Russian: "Рекомендовано для вас"
  },
  "Personalized Nutrition": {
    English: "Personalized Nutrition", Spanish: "Nutrición personalizada", French: "Nutrition personnalisée", German: "Personalisierte Ernährung", Chinese: "个性化营养", Japanese: "パーソナライズされた栄養", Hindi: "व्यक्तिगत पोषण", Arabic: "تغذية مخصصة", Portuguese: "Nutrição Personalizada", Russian: "Персонализированное питание"
  },
  "Pro Feature": {
    English: "Pro Feature", Spanish: "Función Pro", French: "Fonctionnalité Pro", German: "Pro-Funktion", Chinese: "Pro 功能", Japanese: "Pro 機能", Hindi: "प्रो सुविधा", Arabic: "ميزة برو", Portuguese: "Recurso Pro", Russian: "Pro-функция"
  },
  "Unlock Recommendations": {
    English: "Unlock Recommendations", Spanish: "Desbloquear recomendaciones", French: "Débloquer les recommandations", German: "Empfehlungen freischalten", Chinese: "解锁推荐", Japanese: "推奨事項のロックを解除", Hindi: "अनुशंसाएँ अनलॉक करें", Arabic: "فتح التوصيات", Portuguese: "Desbloquear Recomendações", Russian: "Разблокировать рекомендации"
  },
  "Unlock Meal Plans": {
    English: "Unlock Meal Plans", Spanish: "Desbloquear planes de comidas", French: "Débloquer les plans de repas", German: "Mahlzeitenpläne freischalten", Chinese: "解锁饮食计划", Japanese: "ミールプランのロックを解除", Hindi: "भोजन योजनाएं अनलॉक करें", Arabic: "فتح خطط الوجبات", Portuguese: "Desbloquear Planos de Refeição", Russian: "Разблокировать планы питания"
  },
  "View Product": {
    English: "View Product", Spanish: "Ver producto", French: "Voir le produit", German: "Produkt ansehen", Chinese: "查看产品", Japanese: "製品を見る", Hindi: "उत्पाद देखें", Arabic: "عرض المنتج", Portuguese: "Ver Produto", Russian: "Посмотреть продукт"
  },
  "Export Report": {
    English: "Export Report", Spanish: "Exportar informe", French: "Exporter le rapport", German: "Bericht exportieren", Chinese: "导出报告", Japanese: "レポートをエクスポート", Hindi: "रिपोर्ट निर्यात करें", Arabic: "تصدير التقرير", Portuguese: "Exportar Relatório", Russian: "Экспортировать отчет"
  },
  "Sending...": {
    English: "Sending...", Spanish: "Enviando...", French: "Envoi en cours...", German: "Wird gesendet...", Chinese: "正在发送...", Japanese: "送信中...", Hindi: "भेजा जा रहा है...", Arabic: "جاري الإرسال...", Portuguese: "Enviando...", Russian: "Отправка..."
  },
  "Recommended products for you": {
    English: "Recommended products for you", Spanish: "Productos recomendados para ti", French: "Produits recommandés pour vous", German: "Empfohlene Produkte für Sie", Chinese: "为您推荐的产品", Japanese: "あなたへのおすすめ商品", Hindi: "आपके लिए अनुशंसित उत्पाद", Arabic: "المنتجات الموصى بها لك", Portuguese: "Produtos Recomendados para Você", Russian: "Рекомендованные товары для вас"
  },
  "get it": {
    English: "get it", Spanish: "obtener", French: "l'obtenir", German: "hol es dir", Chinese: "获取", Japanese: "手に入れる", Hindi: "इसे प्राप्त करें", Arabic: "احصل عليه", Portuguese: "obter", Russian: "получить"
  },
  "Add to Cart": {
    English: "Add to Cart", Spanish: "Añadir al carrito", French: "Ajouter au panier", German: "In den Warenkorb", Chinese: "加入购物车", Japanese: "カートに入れる", Hindi: "कार्ट में जोड़ें", Arabic: "أضف إلى السلة", Portuguese: "Adicionar ao Carrinho", Russian: "Добавить в корзину"
  },
  "Details": {
    English: "Details", Spanish: "Detalles", French: "Détails", German: "Details", Chinese: "详情", Japanese: "詳細", Hindi: "विवरण", Arabic: "التفاصيل", Portuguese: "Detalhes", Russian: "Подробности"
  },
  "CAL": {
    English: "CAL", Spanish: "CAL", French: "CAL", German: "KAL", Chinese: "卡路里", Japanese: "カロリー", Hindi: "कैलोरी", Arabic: "سعرة", Portuguese: "CAL", Russian: "КАЛ"
  },
  "PRO": {
    English: "PRO", Spanish: "PROT", French: "PROT", German: "EIW", Chinese: "蛋白质", Japanese: "タンパク質", Hindi: "प्रोटीन", Arabic: "بروتين", Portuguese: "PROT", Russian: "БЕЛ"
  },
  "CARB": {
    English: "CARB", Spanish: "CARB", French: "GLUC", German: "KH", Chinese: "碳水", Japanese: "炭水化物", Hindi: "कार्ब", Arabic: "كربوهيدرات", Portuguese: "CARB", Russian: "УГЛ"
  },
  "FAT": {
    English: "FAT", Spanish: "GRASA", French: "LIP", German: "FETT", Chinese: "脂肪", Japanese: "脂質", Hindi: "वसा", Arabic: "دهون", Portuguese: "GORD", Russian: "ЖИР"
  },
  "Premium Choice": {
    English: "Premium Choice", Spanish: "Opción Premium", French: "Choix Premium", German: "Premium-Auswahl", Chinese: "优质选择", Japanese: "プレミアムチョイス", Hindi: "प्रीमियम विकल्प", Arabic: "خيار ممتاز", Portuguese: "Escolha Premium", Russian: "Премиум выбор"
  },
  "How AuraScan Works": {
    English: "How AuraScan Works", Spanish: "Cómo funciona AuraScan", French: "Comment fonctionne AuraScan", German: "Wie AuraScan funktioniert", Chinese: "AuraScan 如何工作", Japanese: "AuraScanの仕組み", Hindi: "AuraScan कैसे काम करता है", Arabic: "كيف يعمل AuraScan", Portuguese: "Como o AuraScan Funciona", Russian: "Как работает AuraScan"
  },
  "Facial Mapping": {
    English: "Face Scanning", Spanish: "Escaneo facial", French: "Scan facial", German: "Gesichtsscan", Chinese: "面部扫描", Japanese: "フェイススキャン", Hindi: "फेस स्कैनिंग", Arabic: "فحص الوجه", Portuguese: "Mapeamento Facial", Russian: "Сканирование лица"
  },
  "Our AI identifies 468+ biometric landmarks to assess micro-expressions and skin markers.": {
    English: "Our smart system looks at hundreds of points on your face to understand how you feel.",
    Spanish: "Nuestro sistema analiza cientos de puntos en tu rostro.",
    French: "Notre système analyse des centaines de points sur votre visage.",
    German: "Unser System analysiert Hunderte von Punkten in Ihrem Gesicht.",
    Chinese: "我们的系统通过分析面部的数百个点来了解您的感受。",
    Japanese: "当社のシステムは顔の数百のポイントを分析して、あなたの状態を理解します。",
    Hindi: "हमारा स्मार्ट सिस्टम आपके चेहरे के सैकड़ों बिंदुओं को देखता है यह समझने के लिए कि आप कैसा महसूस करते हैं।",
    Arabic: "ينظر نظامنا الذكي إلى مئات النقاط على وجهك لفهم شعورك.",
    Portuguese: "Nossa IA identifica centenas de pontos no seu rosto.",
    Russian: "Наша система анализирует сотни точек на вашем лице."
  },
  "Systemic Analysis": {
    English: "Whole Body Check", Spanish: "Chequeo corporal total", French: "Bilan corporel", German: "Ganzkörper-Check", Chinese: "全身检查", Japanese: "全身チェック", Hindi: "पूरे शरीर की जांच", Arabic: "فحص الجسم بالكامل", Portuguese: "Análise Sistêmica", Russian: "Проверка всего тела"
  },
  "Markers are correlated with systemic health indicators like hydration, stress, and metabolism.": {
    English: "We look at things like how hydrated you are and your stress levels.",
    Spanish: "Analizamos niveles de hidratación y estrés.",
    French: "Nous analysons les niveaux d'hydratation et de stress.",
    German: "Wir schauen uns Faktoren wie Hydratation und Stresslevel an.",
    Chinese: "我们关注水分和压力水平等指标。",
    Japanese: "水分補給やストレスレベルなどの指標を確認します。",
    Hindi: "हम देखते हैं कि आप कितने हाइड्रेटेड हैं और आपका तनाव स्तर क्या है।",
    Arabic: "نحن ننظر إلى أشياء مثل مدى ترطيبك ومستويات التوتر لديك.",
    Portuguese: "Analisamos níveis de hidratação e estresse.",
    Russian: "Мы анализируем такие показатели, как уровень гидратации и стресса."
  },
  "Wellness Plan": {
    English: "Wellness Plan", Spanish: "Plan de bienestar", French: "Plan de bien-être", German: "Wellness-Plan", Chinese: "健康计划", Japanese: "ウェルネスプラン", Hindi: "कल्याण योजना", Arabic: "خطة العافية", Portuguese: "Plano de Bem-estar", Russian: "План оздоровления"
  },
  "Receive a personalized 7-day challenge and evidence-based lifestyle recommendations.": {
    English: "Receive a personalized 7-day challenge and evidence-based lifestyle recommendations.",
    Spanish: "Recibe un desafío de 7 días y recomendaciones de estilo de vida.",
    French: "Recevez un défi de 7 jours et des recommandations de style de vie.",
    German: "Erhalten Sie eine personalisierte 7-Tage-Challenge und evidenzbasierte Empfehlungen.",
    Chinese: "收到个性化的 7 天挑战和基于证据的生活方式建议。",
    Japanese: "パーソナライズされた7日間のチャレンジとエビデンスに基づいたライフスタイルの推奨事項を受け取ります。",
    Hindi: "एक व्यक्तिगत 7-दिवसीय चुनौती और साक्ष्य-आधारित जीवन शैली सिफारिशें प्राप्त करें।",
    Arabic: "احصل على تحدٍ مخصص لمدة 7 أيام وتوصيات نمط حياة قائمة على الأدلة.",
    Portuguese: "Receba um desafio de 7 dias personalizado e recomendações de estilo de vida baseadas em evidências.",
    Russian: "Получите персональный 7-дневный план и научно обоснованные рекомендации по образу жизни."
  },
  "Professional-grade biometric analysis for the modern wellness journey. Empowering individuals with data-driven health insights.": {
    English: "Professional-grade biometric analysis for the modern wellness journey. Empowering individuals with data-driven health insights.",
    Spanish: "Análisis biométrico profesional para el viaje de bienestar moderno.",
    French: "Analyse biométrique de qualité professionnelle pour le bien-être moderne.",
    German: "Professionelle biometrische Analyse für die moderne Wellness-Reise.",
    Chinese: "现代健康之旅的专业级生物识别分析。通过数据驱动的健康洞察赋能个人。",
    Japanese: "現代のウェルネスの旅のためのプロフェッショナルグレードのバイオメトリック分析。",
    Hindi: "आधुनिक कल्याण यात्रा के लिए पेशेवर-ग्रेड बायोमेट्रिक विश्लेषण।",
    Arabic: "تحليل قياسات حيوية احترافي لرحلة العافية الحديثة.",
    Portuguese: "Análise biométrica de nível profissional para a jornada de bem-estar moderna.",
    Russian: "Биометрический анализ профессионального уровня для современного пути к здоровью."
  },
  "Legal": {
    English: "Legal", Spanish: "Legal", French: "Juridique", German: "Rechtliches", Chinese: "法律", Japanese: "法務", Hindi: "कानूनी", Arabic: "قانوني", Portuguese: "Legal", Russian: "Юридическая информация"
  },
  "Privacy Policy": {
    English: "Privacy Policy", Spanish: "Política de privacidad", French: "Politique de confidentialité", German: "Datenschutzrichtlinie", Chinese: "隐私政策", Japanese: "プライバシーポリシー", Hindi: "गोपनीयता नीति", Arabic: "سياسة الخصوصية", Portuguese: "Política de Privacidade", Russian: "Политика конфиденциальности"
  },
  "Terms of Service": {
    English: "Terms of Service", Spanish: "Términos de servicio", French: "Conditions d'utilisation", German: "Nutzungsbedingungen", Chinese: "服务条款", Japanese: "利用規約", Hindi: "सेवा की शर्तें", Arabic: "شروط الخدمة", Portuguese: "Termos de Serviço", Russian: "Условия использования"
  },
  "Support": {
    English: "Support", Spanish: "Soporte", French: "Support", German: "Support", Chinese: "支持", Japanese: "サポート", Hindi: "सहायता", Arabic: "الدعم", Portuguese: "Suporte", Russian: "Поддержка"
  },
  "Help Center": {
    English: "Help Center", Spanish: "Centro de ayuda", French: "Centre d'aide", German: "Hilfezentrum", Chinese: "帮助中心", Japanese: "ヘルプセンター", Hindi: "सहायता केंद्र", Arabic: "مركز المساعدة", Portuguese: "Central de Ajuda", Russian: "Справочный центр"
  },
  "Contact Us": {
    English: "Contact Us", Spanish: "Contáctanos", French: "Contactez-nous", German: "Kontaktieren Sie uns", Chinese: "联系我们", Japanese: "お問い合わせ", Hindi: "संपर्क करें", Arabic: "اتصل بنا", Portuguese: "Contate-nos", Russian: "Связаться с нами"
  },
  "API Documentation": {
    English: "API Documentation", Spanish: "Documentación de la API", French: "Documentation API", German: "API-Dokumentation", Chinese: "API 文档", Japanese: "API ドキュメント", Hindi: "एपीआई दस्तावेज़", Arabic: "وثائق API", Portuguese: "Documentação da API", Russian: "Документация API"
  },
  "Verify Science & Logic": {
    English: "Verify Science & Logic", Spanish: "Verificar ciencia y lógica", French: "Vérifier la science et la logique", German: "Wissenschaft & Logik prüfen", Chinese: "验证科学与逻辑", Japanese: "科学と論理の検証", Hindi: "विज्ञान और तर्क सत्यापित करें", Arabic: "التحقق من العلم والمنطق", Portuguese: "Verificar Ciência e Lógica", Russian: "Проверить науку и логику"
  },
  "Methodology": {
    English: "Methodology", Spanish: "Metodología", French: "Méthodologie", German: "Methodik", Chinese: "方法论", Japanese: "方法論", Hindi: "कार्यप्रणाली", Arabic: "منهجية", Portuguese: "Metodologia", Russian: "Методология"
  },
  "Vascular Vitality": {
    English: "Vascular Vitality", Spanish: "Vitalidad vascular", French: "Vitalité vasculaire", German: "Vaskuläre Vitalität", Chinese: "血管活力", Japanese: "血管の活力", Hindi: "संवहनी जीवन शक्ति", Arabic: "الحيوية الوعائية", Portuguese: "Vitalidade Vascular", Russian: "Сосудистая витальность"
  },
  "Our system analyzes capillary density and oxygenation markers in the mucosal and dermal layers.": {
    English: "Our system analyzes capillary density and oxygenation markers in the mucosal and dermal layers.",
    Spanish: "Nuestro sistema analiza la densidad capilar y los marcadores de oxigenación.",
    French: "Notre système analyse la densité capillaire et les marqueurs d'oxygénation.",
    Portuguese: "Nosso sistema analisa a densidade capilar e os marcadores de oxigenação."
  },
  "Dermal Mapping": {
    English: "Dermal Mapping", Spanish: "Mapeo dérmico", French: "Cartographie dermique", German: "Dermales Mapping", Chinese: "皮肤映射", Japanese: "ダーマルマッピング", Hindi: "त्वचीय मानचित्रण", Arabic: "تخطيط الدرم", Portuguese: "Mapeamento Dérmico", Russian: "Дермальное картирование"
  },
  "We map systemic health to specific facial zones based on known dermatological correlations.": {
    English: "We map systemic health to specific facial zones based on known dermatological correlations.",
    Spanish: "Mapeamos la salud sistémica a zonas faciales específicas.",
    French: "Nous cartographions la santé systémique sur des zones faciales spécifiques.",
    Portuguese: "Mapeamos a saúde sistêmica para zonas faciais específicas."
  },
  "AI Reliability": {
    English: "AI Reliability", Spanish: "Fiabilidad de la IA", French: "Fiabilité de l'IA", German: "KI-Zuverlässigkeit", Chinese: "AI 可靠性", Japanese: "AIの信頼性", Hindi: "एआई विश्वसनीयता", Arabic: "موثوقية الذكاء الاصطناعي", Portuguese: "Confiabilidade da IA", Russian: "Надежность ИИ"
  },
  "Calibration Step": {
    English: "Calibration Step", Spanish: "Paso de calibración", French: "Étape de calibration", German: "Kalibrierungsschritt", Chinese: "校准步骤", Japanese: "キャリブレーションステップ", Hindi: "अंशांकन चरण", Arabic: "خطوة المعايرة", Portuguese: "Etapa de Calibração", Russian: "Этап калибровки"
  },
  "Ensure Scientific Accuracy": {
    English: "Ensure Scientific Accuracy", Spanish: "Garantizar la precisión científica", French: "Assurer la précision scientifique", Portuguese: "Garanta a precisão científica"
  },
  "Natural Light": {
    English: "Natural Light", Spanish: "Luz natural", French: "Lumière naturelle", Portuguese: "Luz Natural"
  },
  "Face a window or bright area. Avoid harsh shadows or backlighting.": {
    English: "Face a window or bright area. Avoid harsh shadows or backlighting.",
    Spanish: "Da la cara a una ventana. Evita las sombras fuertes.",
    French: "Faites face à une fenêtre. Évitez les ombres fortes.",
    Portuguese: "Fique de frente para uma janela. Evite sombras fortes."
  },
  "Neutral Expression": {
    English: "Neutral Expression", Spanish: "Expresión neutra", French: "Expression neutre", Portuguese: "Expressão Neutra"
  },
  "Keep your face relaxed. Avoid smiling or squinting during the capture.": {
    English: "Keep your face relaxed. Avoid smiling or squinting during the capture.",
    Spanish: "Mantén la cara relajada. Evita sonreír.",
    French: "Gardez votre visage détendu. Évitez de sourire.",
    Portuguese: "Mantenha o rosto relaxado. Evite sorrir."
  },
  "Lens Distance": {
    English: "Lens Distance", Spanish: "Distancia de la lente", French: "Distance de l'optique", Portuguese: "Distância da Lente"
  },
  "Hold your device at eye level, approximately 30-40cm from your face.": {
    English: "Hold your device at eye level, approximately 30-40cm from your face.",
    Spanish: "Sujeta el dispositivo a la altura de los ojos.",
    French: "Tenez votre appareil à hauteur des yeux.",
    Portuguese: "Segure o dispositivo ao nível dos olhos."
  },
  "Start Calibration": {
    English: "Start Calibration", Spanish: "Iniciar calibración", French: "Démarrer la calibration", Portuguese: "Iniciar Calibração"
  },
  "Ready to Scan": {
    English: "Ready to Scan", Spanish: "Listo para escanear", French: "Prêt à scanner", Portuguese: "Pronto para Escanear"
  },
  "BIOMETRIC REPORT GENERATED": {
    English: "HEALTH REPORT READY", Spanish: "INFORME DE SALUD LISTO", French: "RAPPORT DE SANTÉ PRÊT", Portuguese: "RELATÓRIO DE SAÚDE PRONTO"
  },
  "AURA STATUS": {
    English: "AURA STATUS", Spanish: "ESTADO DE AURA", French: "STATUT AURA", Portuguese: "STATUS DA AURA"
  },
  "Vitality Level": {
    English: "Vitality Level", Spanish: "Nivel de vitalidad", French: "Niveau de vitalité", Portuguese: "Nível de Vitalidade"
  },
  "Confidence Score": {
    English: "Confidence Score", Spanish: "Puntaje de confianza", French: "Score de confiance", Portuguese: "Pontuação de Confiança"
  },
  "SCORE": {
    English: "SCORE", Spanish: "PUNTAJE", French: "SCORE", Portuguese: "PONTUAÇÃO"
  },
  "Facial Zones Analyzed": {
    English: "Facial Zones Analyzed", Spanish: "Zonas faciales analizadas", French: "Zones faciales analysées", Portuguese: "Zonas Faciais Analisadas"
  },
  "Mapped": {
    English: "Mapped", Spanish: "Mapeado", French: "Cartographié", Portuguese: "Mapeado"
  },
  "Regional Scan Summary": {
    English: "Regional Scan Summary", Spanish: "Resumen de escaneo regional", French: "Résumé du scan régional", Portuguese: "Resumo do Scan Regional"
  },
  "Systemic Balance": {
    English: "Systemic Balance", Spanish: "Equilibrio sistémico", French: "Équilibre systémique", Portuguese: "Equilíbrio Sistêmico"
  },
  "Aura Intelligence Summary": {
    English: "Aura Intelligence Summary", Spanish: "Resumen de inteligencia Aura", French: "Résumé d'intelligence Aura", Portuguese: "Resumo de Inteligência Aura"
  },
  "Verify Science": {
    English: "Verify Science", Spanish: "Verificar ciencia", French: "Vérifier la science", Portuguese: "Verificar Ciência"
  },
  "Hydration & Dermal": {
    English: "Hydration & Dermal", Spanish: "Hidratación y dérmico", French: "Hydratation & Derme", Portuguese: "Hidratação e Dérmica"
  },
  "Stress & Nervous": {
    English: "Stress & Nervous", Spanish: "Estrés y nervioso", French: "Stress & Nerveux", Portuguese: "Estresse e Nervoso"
  },
  "Systemic Stability": {
    English: "Systemic Stability", Spanish: "Estabilidad sistémica", French: "Stabilité systémique", Portuguese: "Estabilidade Sistêmica"
  },
  "Strongest Index": {
    English: "Strongest Index", Spanish: "Índice más fuerte", French: "Indice plus fort", Portuguese: "Índice Mais Forte"
  },
  "Primary Focus Area": {
    English: "Primary Focus Area", Spanish: "Área de enfoque principal", French: "Zone d'attention principale", Portuguese: "Área de Foco Principal"
  }
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>('English');

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key; // Fallback to key if translation is missing
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
