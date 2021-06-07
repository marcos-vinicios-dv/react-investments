import axios from 'axios';
import { useEffect, useState } from 'react';
import orgByMonth from '../util/orgByMonth';
import api from '../services/api';
import Item from './Item';
import { formatInvestment } from '../util/format';

const Investments = ({
  typeInvestment = 'Tipo_de_Investimento',
  currentInvestmentId = 'id_do_Investimento',
}) => {
  const [investmentFund, setInvestmentFund] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  let textColor = 'text-green-500';

  useEffect(() => {
    const source = axios.CancelToken.source();
    const cancelToken = source.token;

    async function loadInvestimentsFunds() {
      const res = await api.get('reports', { cancelToken });
      const data = orgByMonth(
        res.data.filter(
          ({ investmentId }) => investmentId === currentInvestmentId
        )
      );

      let i = 0;
      const formatedData = data.map(inv => {
        const percent =
          i !== 0
            ? (data[i].value.toFixed(2) / data[i - 1].value.toFixed(2)) * 100 -
              100
            : i;
        i++;
        return {
          ...inv,
          valueFormated: formatInvestment(inv.value.toFixed(2)),
          percentMonth: percent.toFixed(2),
        };
      });

      setTotalIncome(
        (formatedData[11].value.toFixed(2) / formatedData[0].value.toFixed(2)) *
          100 -
          100
      );

      setInvestmentFund(formatedData);
    }

    loadInvestimentsFunds();

    return () => {
      source.cancel();
    };
  }, [currentInvestmentId]);

  if (totalIncome < 0) {
    textColor = 'text-red-500';
  }

  return (
    <div className="container mx-auto p-4 border my-3 flex flex-col items-center space-x-2">
      <h1 className="text-2xl font-semibold ">{typeInvestment}</h1>
      <h2 className="font-semibold text-lg ">
        Rendimento Total:{' '}
        <span className={`${textColor}`}>{`${formatInvestment(
          totalIncome
        )} (${totalIncome.toFixed(2)}%)`}</span>
      </h2>
      <ul className="min-w-full">
        {investmentFund.map(investment => {
          const incomeExpense =
            investment.percentMonth >= 0 ? 'text-green-500' : 'text-red-500';
          return (
            <Item key={investment.id} textColor={incomeExpense}>
              {investment}
            </Item>
          );
        })}
      </ul>
    </div>
  );
};

export default Investments;
