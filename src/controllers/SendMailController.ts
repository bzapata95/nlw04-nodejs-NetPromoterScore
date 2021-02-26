import { Request, Response } from "express";
import path from "path";
import { getCustomRepository } from "typeorm";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import SendMailService from "../services/SendMailService";

class SendMailController {
  async execute(request: Request, response: Response) {
    const { email, survey_id } = request.body;

    const usersRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const userAlreadyExist = await usersRepository.findOne({ email });

    if (!userAlreadyExist) {
      return response.status(400).json({ error: "User does not exists" });
    }

    const survey = await surveysRepository.findOne({
      id: survey_id,
    });

    if (!survey) {
      return response.status(400).json({ error: "Survey does not exists" });
    }

    const npsPath = path.resolve(
      __dirname,
      "..",
      "views",
      "emails",
      "npsMail.hbs"
    );

    const variables = {
      name: userAlreadyExist.name,
      title: survey.title,
      description: survey.description,
      user_id: userAlreadyExist.id,
      link: process.env.URL_MAIL,
    };

    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
      where: { user_id: userAlreadyExist.id, value: null },
    });

    if (surveyUserAlreadyExists) {
      await SendMailService.execute({
        to: email,
        subject: survey.title,
        variables,
        path: npsPath,
      });
      return response.json(surveyUserAlreadyExists);
    }

    const surveyUser = surveysUsersRepository.create({
      user_id: userAlreadyExist.id,
      survey_id: survey.id,
    });

    await surveysUsersRepository.save(surveyUser);

    await SendMailService.execute({
      to: email,
      subject: survey.title,
      variables,
      path: npsPath,
    });

    return response.json(surveyUser);
  }
}

export { SendMailController };
