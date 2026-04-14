import React, { createContext, useContext, useState, ReactNode } from 'react';

export const languages = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Hindi', 'Arabic', 'Portuguese', 'Russian'
];

type Translations = Record<string, Record<string, string>>;

export const translations: Translations = {
  "Language": {
    English: "Language", Spanish: "Idioma", French: "Langue", German: "Sprache", Chinese: "语言", Japanese: "言語", Hindi: "भाषा", Arabic: "اللغة", Portuguese: "Idioma", Russian: "Язык"
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
    English: "AI-Powered Biometrics", Spanish: "Biometría con IA", French: "Biométrie par IA", German: "KI-gestützte Biometrie", Chinese: "AI驱动的生物识别", Japanese: "AI搭載バイオメトリクス", Hindi: "एआई-संचालित बायोमेट्रिक्स", Arabic: "القياسات الحيوية المدعومة بالذكاء الاصطناعي", Portuguese: "Biometria com IA", Russian: "Биометрия на базе ИИ"
  },
  "Advanced facial analysis for full-body wellness insights and personalized health recommendations.": {
    English: "Advanced facial analysis for full-body wellness insights and personalized health recommendations.",
    Spanish: "Análisis facial avanzado para información de bienestar corporal y recomendaciones de salud.",
    French: "Analyse faciale avancée pour des informations sur le bien-être et des recommandations personnalisées.",
    German: "Erweiterte Gesichtsanalyse für ganzheitliche Wellness-Einblicke und personalisierte Empfehlungen.",
    Chinese: "先进的面部分析，提供全身健康洞察和个性化健康建议。",
    Japanese: "全身の健康状態の把握とパーソナライズされた健康推奨のための高度な顔分析。",
    Hindi: "पूर्ण-शरीर कल्याण अंतर्दृष्टि और व्यक्तिगत स्वास्थ्य सिफारिशों के लिए उन्नत चेहरे का विश्लेषण।",
    Arabic: "تحليل متقدم للوجه للحصول على رؤى صحية شاملة وتوصيات صحية مخصصة.",
    Portuguese: "Análise facial avançada para insights de bem-estar e recomendações de saúde personalizadas.",
    Russian: "Расширенный анализ лица для получения информации о здоровье и персональных рекомендаций."
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
    English: "Cancel Scan", Spanish: "Cancelar escaneo", French: "Annuler le scan", German: "Scan abbrechen", Chinese: "取消扫描", Japanese: "スキャンをキャンセル", Hindi: "स्कैन रद्द करें", Arabic: "إلغاء الفحص", Portuguese: "Cancelar Scan", Russian: "Отменить сканирование"
  },
  "Analysis Failed": {
    English: "Analysis Failed", Spanish: "Análisis fallido", French: "Échec de l'analyse", German: "Analyse fehlgeschlagen", Chinese: "分析失败", Japanese: "分析に失敗しました", Hindi: "विश्लेषण विफल", Arabic: "فشل التحليل", Portuguese: "Falha na Análise", Russian: "Ошибка анализа"
  },
  "Try Again": {
    English: "Try Again", Spanish: "Intentar de nuevo", French: "Réessayer", German: "Erneut versuchen", Chinese: "重试", Japanese: "もう一度お試しください", Hindi: "पुनः प्रयास करें", Arabic: "حاول مرة أخرى", Portuguese: "Tentar Novamente", Russian: "Попробовать снова"
  },
  "LOADING AI MODELS...": {
    English: "LOADING AI MODELS...", Spanish: "CARGANDO MODELOS DE IA...", French: "CHARGEMENT DES MODÈLES IA...", German: "LADE KI-MODELLE...", Chinese: "正在加载AI模型...", Japanese: "AIモデルを読み込み中...", Hindi: "एआई मॉडल लोड हो रहे हैं...", Arabic: "جاري تحميل نماذج الذكاء الاصطناعي...", Portuguese: "CARREGANDO MODELOS DE IA...", Russian: "ЗАГРУЗКА ИИ-МОДЕЛЕЙ..."
  },
  "INITIALIZING BIOMETRIC ENGINE...": {
    English: "INITIALIZING BIOMETRIC ENGINE...", Spanish: "INICIALIZANDO MOTOR BIOMÉTRICO...", French: "INITIALISATION DU MOTEUR BIOMÉTRIQUE...", German: "INITIALISIERE BIOMETRIE-ENGINE...", Chinese: "正在初始化生物识别引擎...", Japanese: "バイオメトリックエンジンを初期化中...", Hindi: "बायोमेट्रिक इंजन प्रारंभ हो रहा है...", Arabic: "جاري تهيئة محرك القياسات الحيوية...", Portuguese: "INICIALIZANDO MOTOR BIOMÉTRICO...", Russian: "ИНИЦИАЛИЗАЦИЯ БИОМЕТРИЧЕСКОГО ДВИЖКА..."
  },
  "DECODING BIOMETRICS": {
    English: "DECODING BIOMETRICS", Spanish: "DECODIFICANDO BIOMETRÍA", French: "DÉCODAGE DE LA BIOMÉTRIE", German: "DEKODIERE BIOMETRIE", Chinese: "解码生物特征", Japanese: "バイオメトリクスをデコード中", Hindi: "बायोमेट्रिक्स डिकोड कर रहा है", Arabic: "فك تشفير القياسات الحيوية", Portuguese: "DECODIFICANDO BIOMETRIA", Russian: "ДЕКОДИРОВАНИЕ БИОМЕТРИИ"
  },
  "Camera access denied. Please allow camera access in your browser settings/address bar and try again.": {
    English: "Camera access denied. Please allow camera access in your browser settings/address bar and try again.",
    Spanish: "Acceso a la cámara denegado. Permita el acceso en la configuración de su navegador y vuelva a intentarlo.",
    French: "Accès à la caméra refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur et réessayer.",
    German: "Kamerazugriff verweigert. Bitte erlauben Sie den Zugriff in Ihren Browsereinstellungen und versuchen Sie es erneut.",
    Chinese: "无法访问相机。请在浏览器设置中允许访问相机，然后重试。",
    Japanese: "カメラへのアクセスが拒否されました。ブラウザの設定でカメラへのアクセスを許可し、もう一度お試しください。",
    Hindi: "कैमरा एक्सेस अस्वीकृत। कृपया अपनी ब्राउज़र सेटिंग में कैमरा एक्सेस की अनुमति दें और पुनः प्रयास करें।",
    Arabic: "تم رفض الوصول إلى الكاميرا. يرجى السماح بالوصول إلى الكاميرا في إعدادات المتصفح والمحاولة مرة أخرى.",
    Portuguese: "Acesso à câmera negado. Permita o acesso na configuração do seu navegador e tente novamente.",
    Russian: "Доступ к камере запрещен. Пожалуйста, разрешите доступ к камере в настройках вашего браузера и повторите попытку."
  },
  "Failed to load AI models. Please refresh.": {
    English: "Failed to load AI models. Please refresh.", Spanish: "Error al cargar modelos de IA. Por favor, actualiza.", French: "Échec du chargement des modèles IA. Veuillez rafraîchir.", German: "Fehler beim Laden der KI-Modelle. Bitte aktualisieren.", Chinese: "加载AI模型失败。请刷新。", Japanese: "AIモデルの読み込みに失敗しました。更新してください。", Hindi: "एआई मॉडल लोड करने में विफल। कृपया रीफ्रेश करें।", Arabic: "فشل تحميل نماذج الذكاء الاصطناعي. يرجى التحديث.", Portuguese: "Falha ao carregar modelos de IA. Atualize a página.", Russian: "Не удалось загрузить ИИ-модели. Пожалуйста, обновите страницу."
  },
  "Retry Camera": {
    English: "Retry Camera", Spanish: "Reintentar cámara", French: "Réessayer la caméra", German: "Kamera erneut versuchen", Chinese: "重试相机", Japanese: "カメラを再試行", Hindi: "कैमरा पुनः प्रयास करें", Arabic: "إعادة محاولة الكاميرا", Portuguese: "Tentar Câmera Novamente", Russian: "Повторить попытку камеры"
  },
  "Too dark for accurate scan": {
    English: "Too dark for accurate scan", Spanish: "Demasiado oscuro para un escaneo preciso", French: "Trop sombre pour un scan précis", German: "Zu dunkel für einen genauen Scan", Chinese: "太暗，无法进行准确扫描", Japanese: "暗すぎて正確なスキャンができません", Hindi: "सटीक स्कैन के लिए बहुत अंधेरा", Arabic: "مظلم جدًا لإجراء فحص دقيق", Portuguese: "Muito escuro para um scan preciso", Russian: "Слишком темно для точного сканирования"
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
    English: "AuraScan Biometric Report", Spanish: "Informe biométrico de AuraScan", French: "Rapport biométrique AuraScan", German: "AuraScan Biometrischer Bericht", Chinese: "AuraScan生物识别报告", Japanese: "AuraScanバイオメトリクスレポート", Hindi: "AuraScan बायोमेट्रिक रिपोर्ट", Arabic: "تقرير القياسات الحيوية AuraScan", Portuguese: "Relatório Biométrico AuraScan", Russian: "Биометрический отчет AuraScan"
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
    English: "AuraScan is an AI-powered wellness tool and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.",
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
    English: "optimal", Spanish: "óptimo", French: "optimal", German: "optimal", Chinese: "最佳", Japanese: "最適", Hindi: "इष्टतम", Arabic: "أمثل", Portuguese: "ideal", Russian: "оптимально"
  },
  "fair": {
    English: "fair", Spanish: "regular", French: "passable", German: "befriedigend", Chinese: "一般", Japanese: "普通", Hindi: "निष्पक्ष", Arabic: "مقبول", Portuguese: "razoável", Russian: "удовлетворительно"
  },
  "attention needed": {
    English: "attention needed", Spanish: "necesita atención", French: "attention requise", German: "Aufmerksamkeit erforderlich", Chinese: "需要注意", Japanese: "注意が必要", Hindi: "ध्यान देने की आवश्यकता है", Arabic: "بحاجة للاهتمام", Portuguese: "requer atenção", Russian: "требует внимания"
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
  "Sending...": {
    English: "Sending...", Spanish: "Enviando...", French: "Envoi en cours...", German: "Wird gesendet...", Chinese: "正在发送...", Japanese: "送信中...", Hindi: "भेजा जा रहा है...", Arabic: "جاري الإرسال...", Portuguese: "Enviando...", Russian: "Отправка..."
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
