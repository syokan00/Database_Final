// 模拟数据 - 用于演示（当后端不可用时）
export const mockPosts = [
    {
        id: 1,
        author_id: 1,
        author_name: "田中太郎",
        author_avatar: null,
        title: "データベースの授業について",
        content: "データベースの授業はとても実践的で、実際のプロジェクトで使える知識が学べます。特にSQLの書き方や正規化の概念が理解できて良かったです。",
        category: "class",
        tag: "study",
        language: "ja",
        restriction_type: null,
        created_at: "2024-01-15T10:00:00Z",
        images: [],
        attachments: [],
        likes_count: 5,
        comments_count: 2,
        liked_by_me: false,
        favorited_by_me: false
    },
    {
        id: 2,
        author_id: 2,
        author_name: "佐藤花子",
        author_avatar: null,
        title: "研究室選びのポイント",
        content: "研究室を選ぶ際は、自分の興味のある分野と教授の研究内容が合っているかが重要です。また、先輩との相性も大切なので、説明会に参加することをおすすめします。",
        category: "lab",
        tag: "lab",
        language: "ja",
        restriction_type: null,
        created_at: "2024-01-14T14:30:00Z",
        images: [],
        attachments: [],
        likes_count: 8,
        comments_count: 3,
        liked_by_me: false,
        favorited_by_me: false
    },
    {
        id: 3,
        author_id: 3,
        author_name: "鈴木一郎",
        author_avatar: null,
        title: "就活の面接対策",
        content: "就活の面接では、自分の強みを具体的なエピソードとともに説明できるように準備しておくことが大切です。また、企業研究をしっかり行い、その企業で働きたい理由を明確にしておきましょう。",
        category: "job",
        tag: "jobhunt",
        language: "ja",
        restriction_type: null,
        created_at: "2024-01-13T09:15:00Z",
        images: [],
        attachments: [],
        likes_count: 12,
        comments_count: 5,
        liked_by_me: false,
        favorited_by_me: false
    }
];

export const mockItems = [
    {
        id: 1,
        user_id: 1,
        user_name: "田中太郎",
        title: "データベースの教科書",
        description: "使用済みですが、状態は良好です。書き込みはほとんどありません。",
        category: "textbook",
        price: 2000,
        status: "selling",
        images: [],
        attachments: [],
        created_at: "2024-01-10T10:00:00Z"
    },
    {
        id: 2,
        user_id: 2,
        user_name: "佐藤花子",
        title: "プログラミングの参考書",
        description: "Python入門書です。初心者向けで分かりやすいです。",
        category: "textbook",
        price: 1500,
        status: "selling",
        images: [],
        attachments: [],
        created_at: "2024-01-09T14:00:00Z"
    }
];

