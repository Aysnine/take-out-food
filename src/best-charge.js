
function bestCharge(selectedItems) {
  const Items = loadAllItems()
  const Promotions = loadPromotions()

  // * ['ITEM0013 x 4'] => [{ id: 'ITEM0013', count: 4, price, name }]
  const List = selectedItems.map(i => {
    let [id, count] = i.split(' x ');
    return { ...Items.find(i => i.id === id), count: ~~count };
  });

  // 原价
  const prime = List.reduce((x, { price, count }) => x += price * count, 0);

  // 优惠结果集
  const results = Promotions.map(prom => {
    const { type, items } = prom;

    if (type === '满30减6元' && prime >= 30) {
      return { ...prom, final: prime - 6 };
    }

    if (type === '指定菜品半价') {
      let point = []
      let sum = List.reduce((x, { id, count, price }) => {
        x += items.indexOf(id) > -1 ? (point.push(id), price * count / 2) : price * count;
        return x;
      }, 0);
      const final = { ...prom, final: sum, items: items.map(i => Items.find(({ id }) => i === id)) };
      return point.length > 0 ? final : false;
    }

    return false;
  }).filter(i => i != false);

  // 优惠结果
  const result = results.length ? results.sort((A, B) => A.final - B.final)[0] : false;

  // 总价
  const final_price = result ? result.final : prime;

  // 打印小票
  return [
    '============= 订餐明细 =============',
    ...List.map(({ name, count, price }) => `${name} x ${count} = ${price * count}元`),
    ...(result ? [
      '-----------------------------------',
      '使用优惠:',
      `${result.type}${result.items ? '(' + result.items.map(i => i.name).join('，') + ')' : ''}，省${prime - final_price}元`
    ] : []),
    '-----------------------------------',
    `总计：${final_price}元`,
    '==================================='
  ].join("\n")
}
