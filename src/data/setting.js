const settingDefaultData = (req, objectId) => {
  const { body } = req
  return {
    prefix: objectId,
    info: {
      language: {
        enabled: {
          en: true,
          th: true,
        },
      },
      title: {
        en: body.prefix,
        th: body.prefix,
      },
      description: {
        en: 'เว็บฝาก-ถอนเร็ว แจกหนัก จ่ายทุกยอด ไม่มีบิท',
        th: 'เว็บฝาก-ถอนเร็ว แจกหนัก จ่ายทุกยอด ไม่มีบิท',
      },
    },
    contacts: [],
    announcement: {
      isActive: true,
      display: {
        en: `Welcome to ${body.prefix}, the greatest online gambling website of this era. A center for all casinos and slot camps. Apply to be a rider in our field to receive special privileges every week. Covering financial transactions with cutting-edge technology, deposit-withdraw quickly 24 hours a day. ${body.prefix}, a leading website, fast, strong, beyond miles.`,
        th: `ยินดีต้อนรับเข้าสู่ ${body.prefix} เว็บพนันออนไลน์ที่ยิ่งใหญ่ที่สุดในยุคนี้ ศูนย์รวมคาสิโนและค่ายสล็อตทุกค่าย สมัครเข้ามาเป็นนักบิด ในสนามของเรา เพื่อรับสิทธิพิเศษทุกสัปดาห์ ครอบคลุมธุรกรรมการเงินด้วยเทคโนโลยีล้ำสมัย ฝาก-ถอน ไวตลอด 24 ชั่วโมง ${body.prefix} เว็บชั้นนำ เร็ว แรง ทะลุไมล์`,
      },
    },
    banners: [],
    imageUrl: {
      appIcon: `https://api.northerndevel.com/images/${objectId.toString()}/app-icons/`,
      banner: `https://api.northerndevel.com/images/${objectId.toString()}/banners/`,
      icon: `https://api.northerndevel.com/images/${objectId.toString()}/icons/`,
      logo: `https://api.northerndevel.com/images/${objectId.toString()}/logos/`,
      popup: `https://api.northerndevel.com/images/${objectId.toString()}/popups/`,
    },
    url: 'https://api.northerndevel.com',
  }
}

export { settingDefaultData }
